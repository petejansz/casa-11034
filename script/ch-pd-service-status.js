/**
 * Author: Pete Jansz
*/
const modulesPath = '/usr/share/node_modules/'
var fs = require( 'fs' )
var util = require( 'util' )
var csv = require( modulesPath + 'csv-parser' )
var program = require( modulesPath + 'commander' )
var chPdService = require( process.env.USERPROFILE + '/Documents/Projects/igt/pd/casa-11034/script/' + 'lib-ch-pd-service-status' )
const RESTORE_FILENAME = 'ca_updateservice_restore.csv'

program
    .version( '2.0.18.0' )
    .description( 'Change PD service status by creating a batch updateservice CSV from an SQL export DEL file' )
    .usage( ' ARGS' )
    .option( '--csvfile [csvfile]', chPdService.getSqlResultHeaders() )
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
    fs.writeFileSync( RESTORE_FILENAME, chPdService.createServiceCsvHeader() )
}

const EmailVerifiedStatus = chPdService.getEmailVerifiedEnum()
const ServiceStatus = chPdService.getServiceStatusEnum()
var players = []

if ( program.report )
{
    console.log( '%s %s %s %s %s %s  %s',
        'CONTRACT_IDENTITY', 'CONTRACT_ID', 'EMAIL_VERIFIED_Status',
        'Portal_Service_Status', 'SC_Status', 'NEW_Status', 'ACCOUNT_EMAIL' )
}

inputStream
    .pipe( csv( chPdService.getSqlResultHeaders().split( ',' ) ) )
    .on( 'data', function ( data )
    {
        var player1 = chPdService.convertCsvRecordToPlayer( data )

        if (
            player1.portalService == ServiceStatus.CLOSED
            || player1.portalService == ServiceStatus.COMPLETED
            || player1.secondChanceService == ServiceStatus.CLOSED
            || player1.secondChanceService == ServiceStatus.COMPLETED
        )
        {
            return
        }

        player = createNewState( player1 )

        if ( player.newState == ServiceStatus.ACTIVE || player.newState == ServiceStatus.PREACTIVE || player.newState == ServiceStatus.SUSPEND )
        {
            players.push( player )

            if ( program.restoreCsv )
            {
                var currentCsv = csvLine = util.format( '%s,%s,%s,%s\n',
                    player1.accountEmail, player1.portalService, player1.secondChanceService, player1.emailVerified )

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
                console.log( chPdService.convertPlayerToFormattedString( player ) )
            }
        }
    } )
    .on( 'end', function ()
    {
        if ( program.serviceCsv )
        {
            chPdService.wrServiceCsvFile( program.serviceCsv, players )
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
    var newPlayer = Object.assign( {}, player )
    newPlayer.newState = null

    // 1
    if ( newPlayer.emailVerified && newPlayer.portalService == ServiceStatus.PREACTIVE && newPlayer.secondChanceService == ServiceStatus.PREACTIVE )
    {
        newPlayer.newState = ServiceStatus.SUSPEND
        newPlayer.emailVerified = EmailVerifiedStatus.VERIFIED
    }
    // 2
    else if ( newPlayer.emailVerified && newPlayer.portalService == ServiceStatus.PREACTIVE && newPlayer.secondChanceService == ServiceStatus.ACTIVE )
    {
        newPlayer.newState = ServiceStatus.ACTIVE
        newPlayer.emailVerified = EmailVerifiedStatus.VERIFIED
    }
    // 3
    else if ( !newPlayer.emailVerified && newPlayer.portalService == ServiceStatus.SUSPEND && newPlayer.secondChanceService == ServiceStatus.PREACTIVE )
    {
        newPlayer.newState = ServiceStatus.PREACTIVE
        newPlayer.emailVerified = EmailVerifiedStatus.NOT_VERIFIED
    }
    // 4
    else if ( newPlayer.emailVerified && newPlayer.portalService == ServiceStatus.ACTIVE && newPlayer.secondChanceService == ServiceStatus.PREACTIVE )
    {
        newPlayer.newState = ServiceStatus.ACTIVE
        newPlayer.emailVerified = EmailVerifiedStatus.VERIFIED
    }
    // 5
    else if ( newPlayer.emailVerified && newPlayer.portalService == ServiceStatus.SUSPEND && newPlayer.secondChanceService == ServiceStatus.PREACTIVE )
    {
        newPlayer.newState = ServiceStatus.SUSPEND
        newPlayer.emailVerified = EmailVerifiedStatus.VERIFIED
    }
    // 6
    else if ( newPlayer.emailVerified && newPlayer.portalService == ServiceStatus.PREACTIVE && newPlayer.secondChanceService == ServiceStatus.SUSPEND )
    {
        newPlayer.newState = ServiceStatus.SUSPEND
        newPlayer.emailVerified = EmailVerifiedStatus.VERIFIED
    }
    // 7
    else if ( newPlayer.emailVerified && newPlayer.portalService == ServiceStatus.ACTIVE && newPlayer.secondChanceService == ServiceStatus.SUSPEND )
    {
        newPlayer.newState = ServiceStatus.SUSPEND
        newPlayer.emailVerified = EmailVerifiedStatus.VERIFIED
    }
    // 8
    else if ( newPlayer.emailVerified && newPlayer.portalService == ServiceStatus.SUSPEND && newPlayer.secondChanceService == ServiceStatus.ACTIVE )
    {
        newPlayer.newState = ServiceStatus.SUSPEND
        newPlayer.emailVerified = EmailVerifiedStatus.VERIFIED
    }
    // 9
    else if ( !newPlayer.emailVerified && newPlayer.portalService == ServiceStatus.ACTIVE && newPlayer.secondChanceService == ServiceStatus.ACTIVE )
    {
        newPlayer.newState = ServiceStatus.PREACTIVE
        newPlayer.emailVerified = EmailVerifiedStatus.NOT_VERIFIED
    }
    // 10
    else if ( newPlayer.emailVerified && newPlayer.portalService == ServiceStatus.SUSPEND && newPlayer.secondChanceService == ServiceStatus.SUSPEND )
    {
        // ignore
    }
    // 11
    else if ( !newPlayer.emailVerified && newPlayer.portalService == ServiceStatus.SUSPEND && newPlayer.secondChanceService == ServiceStatus.SUSPEND )
    {
        newPlayer.newState = ServiceStatus.SUSPEND
        newPlayer.emailVerified = EmailVerifiedStatus.VERIFIED
    }

    return newPlayer
}


