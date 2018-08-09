/**
 * Author: Pete Jansz
*/
var fs = require( 'fs' )
var path = require( 'path' )
var util = require( 'util' )
var csv = require( process.env.USERPROFILE + '/AppData/Roaming/npm/node_modules/csv-parser' )
var program = require( process.env.USERPROFILE + '/AppData/Roaming/npm/node_modules/commander' )

program
    .version( '2.0.19-SNAPSHOT' )
    .description( 'Change PD service status by creating a batch updateservice CSV from an SQL export DEL file' )
    .usage( ' ARGS' )
    .option( '--csvfile [csvfile]', 'CSV file or stdin of CONTRACT_IDENTITY,CONTRACT_ID,EMAIL_VERIFIED,SERVICE_TYPE_IDS,SERVICE_STATUS_IDS' )
    .option( '--of [outputfile]', 'Write SQL to output file' )
    .option( '--report', 'Print players' )
    .option( '--restore-csv', 'Write a restore csv file to restore to original csvfile' )
    .option( '--service-csv [output-csv-file]', 'Write batch update service csv file' )
    .option( '--sqlt [sqlt]', 'SQL template file' )
    .parse( process.argv )

process.exitCode = 1

if ( !program.help ) //|| (!program.report && !program.serviceCsv))
{
    program.help()
    process.exit()
}

var sqlt
if ( program.sqlt )
{
    sqlt = require( path.resolve( program.sqlt ) )
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
    process.exit()
}

if ( program.restoreCsv )
{
    fs.writeFileSync( 'restore.csv', createServiceCsvHeader() )
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
    .pipe( csv() )
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

            if (program.restoreCsv)
            {
                var currentCsv = csvLine = util.format( '%s,%s,%s,%s\n',
                player.accountEmail, player.portalService, player.secondChanceService, player.emailVerified )

                fs.appendFileSync('restore.csv', currentCsv, err =>
                {
                    if (err)
                    {
                        throw err
                    }
                    else
                    {
                        console.log(currentCsv)
                    }
                })
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

        if ( sqlt )
        {
            generateSql( players, sqlt, sqlt.statements )
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
    header += util.format('# ACCOUNT_EMAIL,PORTAL_SERVICE,SECONDCHANCE_SERVICE,EMAIL_VERIFIED\n')
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

    if ( csvRecord.SERVICE_TYPE_IDS.match("^1, 500") && csvRecord.SERVICE_STATUS_IDS.includes( ',' ) )
    {
        player.portalService = parseInt( csvRecord.SERVICE_STATUS_IDS.split( ',' )[0].trim() )
        player.secondChanceService = parseInt( csvRecord.SERVICE_STATUS_IDS.split( ',' )[1].trim() )
    }
    else if ( csvRecord.SERVICE_TYPE_IDS.match("^500, 1") && csvRecord.SERVICE_STATUS_IDS.includes( ',' ) )
    {
        player.portalService = parseInt( csvRecord.SERVICE_STATUS_IDS.split( ',' )[1].trim() )
        player.secondChanceService = parseInt( csvRecord.SERVICE_STATUS_IDS.split( ',' )[0].trim() )
    }

    return player
}

function generateSql( players, sqlt, statements )
{
    var sqlCode = util.format( "-- Generated by %s @ %s", path.basename( __filename ), Date() )
    sqlCode += "\n-- " + sqlt.description + "\n"

    if ( program.of )
    {
        fs.writeFileSync( program.of, sqlCode )
    }
    else
    {
        console.log( sqlCode )
    }

    var sqlStatementTemplate = statements.join( "\n\n" )

    for ( i = 0; i < players.length; i++ )
    {
        var player = players[i]

        // Ensure we've match correct SQL template with player.newState
        if ( player.newState === sqlt.serviceStatus )
        {
            var sqlCode = sqlStatementTemplate
            sqlCode = sqlCode.replace( /contractIdentity/g, player.contractIdentity )
            sqlCode = sqlCode.replace( /contractId/g, player.contractId )
            sqlCode = sqlCode.replace( /contractLastUpdated/g, player.contractLastUpdated )
            sqlCode = sqlCode.replace( /customerContactsLastUpdated/g, player.customerContactsLastUpdated )
            sqlCode = sqlCode.replace( /customerServiceLastUpdated/g, player.customerServiceLastUpdated )

            if ( program.of )
            {
                fs.appendFileSync( program.of, sqlCode )
            }
            else
            {
                console.log( sqlCode )
            }
        }
    }
}
