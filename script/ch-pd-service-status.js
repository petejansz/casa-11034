/**
 * Author: Pete Jansz
*/
const modulesPath = '/usr/share/node_modules/'
var fs = require( 'fs' )
var path = require( 'path' )
var util = require( 'util' )
var csv = require( modulesPath + 'csv-parser' )
var program = require( modulesPath + 'commander' )
const CSV_FILE_HEADERS = 'CONTRACT_IDENTITY,ACCOUNT_EMAIL,C_LAST_UPDATED,CONTRACT_ID,EMAIL_VERIFIED,CC_LAST_UPDATED,SERVICE_TYPE_IDS,SERVICE_STATUS_IDS,CS_LAST_UPDATED'
const RESTORE_FILENAME = 'ca_updateservice_restore.csv'

program
    .version( '2.0.18.0' )
    .description( 'Change PD service status by creating a batch updateservice CSV from an SQL export DEL file' )
    .usage( ' ARGS' )
    .option( '--csvfile [csvfile]', CSV_FILE_HEADERS )
    .option( '--report', 'Print players' )
    .option( '--restore-csv', 'Write ' + RESTORE_FILENAME + ' file to restore to original state' )
    .option( '--service-csv [output-csv-file]', 'Write batch update service csv file' )
    .parse( process.argv )

process.exitCode = 1

if ( !program.report )
{
    program.help()
}

var inputStream = null

if ( program.csvfile )
{
    inputStream = fs.createReadStream( program.csvfile )
}
else
{
    inputStream = process.stdin
}

if ( inputStream == null )
{
    program.help()
}

if ( program.restoreCsv )
{
    fs.writeFileSync( RESTORE_FILENAME, createServiceCsvHeader() )
}

const emailVerifiedStatus =
{
    NOT_VERIFIED: 0,
    VERIFIED: 1
}

const ServiceStatus =
{
    PREACTIVE: 1,
    ACTIVE: 2,
    SUSPEND: 3,
    CLOSED: 4,
    COMPLETED: 5
}

var players = []

if ( program.report )
{
    console.log( '%s %s %s %s %s %s  %s',
        'CONTRACT_IDENTITY', 'CONTRACT_ID', 'EMAIL_VERIFIED_Status',
        'Portal_Service_Status', 'SC_Status', 'NEW_Status', 'ACCOUNT_EMAIL' )
}

inputStream
    .pipe( csv( CSV_FILE_HEADERS.split( ',' ) ) )
    .on( 'data', function ( data )
    {
        var player = convertCsvRecordToPlayer( data )

        if (
            player.portalService == ServiceStatus.CLOSED
            || player.portalService == ServiceStatus.COMPLETED
            || player.secondChanceService == ServiceStatus.CLOSED
            || player.secondChanceService == ServiceStatus.COMPLETED
        )
        {
            return
        }

        player = createNewState( player )

        if ( player.newState == ServiceStatus.ACTIVE || player.newState == ServiceStatus.PREACTIVE || player.newState == ServiceStatus.SUSPEND )
        {
            players.push( player )

            if ( program.restoreCsv )
            {
                var currentCsv = csvLine = util.format( '%s,%s,%s,%s\n',
                    player.accountEmail, player.portalService, player.secondChanceService, player.emailVerified )

                fs.appendFileSync( RESTORE_FILENAME, currentCsv, err =>
                {
                    if ( err )
                    {
                        throw err
                    }
                    else
                    {
                        console.log( currentCsv )
                    }
                } )
            }

            if ( program.report )
            {
                console.log( convertPlayerToFormattedString( player ) )
            }
        }
    } )
    .on( 'end', function ()
    {
        if ( program.serviceCsv )
        {
            wrServiceCsv( players )
        }

        process.exitCode = 0
    } )


///////////////////////////////////////////////////////////////////////////////
/**
 * Create newState to player and return player
 * @param {*} player
 */
function createNewState( player )
{
    player.newState = null

    // 1
    if ( player.emailVerified && player.portalService == ServiceStatus.PREACTIVE && player.secondChanceService == ServiceStatus.PREACTIVE )
    {
        player.newState = ServiceStatus.SUSPEND
        player.emailVerified = emailVerifiedStatus.VERIFIED
    }
    // 2
    else if ( player.emailVerified && player.portalService == ServiceStatus.PREACTIVE && player.secondChanceService == ServiceStatus.ACTIVE )
    {
        player.newState = ServiceStatus.ACTIVE
        player.emailVerified = emailVerifiedStatus.VERIFIED
    }
    // 3
    else if ( !player.emailVerified && player.portalService == ServiceStatus.SUSPEND && player.secondChanceService == ServiceStatus.PREACTIVE )
    {
        player.newState = ServiceStatus.PREACTIVE
        player.emailVerified = emailVerifiedStatus.NOT_VERIFIED
    }
    // 4
    else if ( player.emailVerified && player.portalService == ServiceStatus.ACTIVE && player.secondChanceService == ServiceStatus.PREACTIVE )
    {
        player.newState = ServiceStatus.ACTIVE
        player.emailVerified = emailVerifiedStatus.VERIFIED
    }
    // 5
    else if ( player.emailVerified && player.portalService == ServiceStatus.SUSPEND && player.secondChanceService == ServiceStatus.PREACTIVE )
    {
        player.newState = ServiceStatus.SUSPEND
        player.emailVerified = emailVerifiedStatus.VERIFIED
    }
    // 6
    else if ( player.emailVerified && player.portalService == ServiceStatus.PREACTIVE && player.secondChanceService == ServiceStatus.SUSPEND )
    {
        player.newState = ServiceStatus.SUSPEND
        player.emailVerified = emailVerifiedStatus.VERIFIED
    }
    // 7
    else if ( player.emailVerified && player.portalService == ServiceStatus.ACTIVE && player.secondChanceService == ServiceStatus.SUSPEND )
    {
        player.newState = ServiceStatus.SUSPEND
        player.emailVerified = emailVerifiedStatus.VERIFIED
    }
    // 8
    else if ( player.emailVerified && player.portalService == ServiceStatus.SUSPEND && player.secondChanceService == ServiceStatus.ACTIVE )
    {
        player.newState = ServiceStatus.SUSPEND
        player.emailVerified = emailVerifiedStatus.VERIFIED
    }
    // 9
    else if ( !player.emailVerified && player.portalService == ServiceStatus.ACTIVE && player.secondChanceService == ServiceStatus.ACTIVE )
    {
        player.newState = ServiceStatus.PREACTIVE
        player.emailVerified = emailVerifiedStatus.NOT_VERIFIED
    }
    // 10
    else if ( player.emailVerified && player.portalService == ServiceStatus.SUSPEND && player.secondChanceService == ServiceStatus.SUSPEND )
    {
        // ignore
    }
    // 11
    else if ( !player.emailVerified && player.portalService == ServiceStatus.SUSPEND && player.secondChanceService == ServiceStatus.SUSPEND )
    {
        player.newState = ServiceStatus.SUSPEND
        player.emailVerified = emailVerifiedStatus.VERIFIED
    }

    return player
}

function createServiceCsvHeader()
{
    var header = util.format( "# Generated by %s @ %s\n", path.basename( __filename ), Date() )
    header += util.format( '# ACCOUNT_EMAIL,PORTAL_SERVICE,SECONDCHANCE_SERVICE,EMAIL_VERIFIED\n' )
    return header
}

function wrServiceCsv( players )
{
    var header = createServiceCsvHeader()

    fs.writeFileSync( program.serviceCsv, header )

    for ( i = 0; i < players.length; i++ )
    {
        var player = players[i]
        var csvLine = util.format( '%s,%s,%s,%s\n',
            player.accountEmail, player.newState, player.newState, player.emailVerified )
        fs.appendFileSync( program.serviceCsv, csvLine )
    }
}

function convertPlayerToFormattedString( player )
{
    var player2 = Object.assign( {}, player )

    player2.emailVerified = player2.emailVerified == 1 ? 'EMAIL_VERIFIED' : 'NOT_VERIFIED'
    if ( player2.portalService == ServiceStatus.ACTIVE ) { player2.portalService = 'ACTIVE' }
    if ( player2.portalService == ServiceStatus.SUSPEND ) { player2.portalService = 'SUSPEND' }
    if ( player2.portalService == ServiceStatus.PREACTIVE ) { player2.portalService = 'PREACTIVE' }

    if ( player2.secondChanceService == ServiceStatus.ACTIVE ) { player2.secondChanceService = 'ACTIVE' }
    if ( player2.secondChanceService == ServiceStatus.SUSPEND ) { player2.secondChanceService = 'SUSPEND' }
    if ( player2.secondChanceService == ServiceStatus.PREACTIVE ) { player2.secondChanceService = 'PREACTIVE' }

    if ( player2.newState == ServiceStatus.ACTIVE ) { player2.newState = 'ACTIVE' }
    if ( player2.newState == ServiceStatus.SUSPEND ) { player2.newState = 'SUSPEND' }
    if ( player2.newState == ServiceStatus.PREACTIVE ) { player2.newState = 'PREACTIVE' }

    var outputStr =
        player2.contractIdentity.toString().padStart( 17 )
        + player2.contractId.toString().padStart( 12 )
        + player2.emailVerified.toString().padStart( 22 )
        + player2.portalService.toString().padStart( 22 )
        + player2.secondChanceService.toString().padStart( 10 )
        + player2.newState.toString().padStart( 11 )
        + ' '.padStart( 2 )
        + player2.accountEmail.toString()
    return outputStr
}

function convertCsvRecordToPlayer( csvRecord )
{
    var player =
    {
        contractIdentity: csvRecord.CONTRACT_IDENTITY.trim(),
        contractLastUpdated: csvRecord.C_LAST_UPDATED.trim(),
        contractId: parseInt( csvRecord.CONTRACT_ID.trim() ),
        accountEmail: csvRecord.ACCOUNT_EMAIL.trim(),
        emailVerified: parseInt( csvRecord.EMAIL_VERIFIED.trim() ),
        customerContactsLastUpdated: csvRecord.CC_LAST_UPDATED.trim(),
        portalService: 0,
        secondChanceService: 0,
        customerServiceLastUpdated: csvRecord.CS_LAST_UPDATED.trim()
    }

    if ( csvRecord.SERVICE_TYPE_IDS.match( "^1, 500" ) && csvRecord.SERVICE_STATUS_IDS.includes( ',' ) )
    {
        player.portalService = parseInt( csvRecord.SERVICE_STATUS_IDS.split( ',' )[0].trim() )
        player.secondChanceService = parseInt( csvRecord.SERVICE_STATUS_IDS.split( ',' )[1].trim() )
    }
    else if ( csvRecord.SERVICE_TYPE_IDS.match( "^500, 1" ) && csvRecord.SERVICE_STATUS_IDS.includes( ',' ) )
    {
        player.portalService = parseInt( csvRecord.SERVICE_STATUS_IDS.split( ',' )[1].trim() )
        player.secondChanceService = parseInt( csvRecord.SERVICE_STATUS_IDS.split( ',' )[0].trim() )
    }

    return player
}

