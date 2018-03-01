/**
 * Author: Pete Jansz
*/
var fs = require( 'fs' )
var path = require( 'path' )
var util = require( 'util' )
var csv = require( process.env.USERPROFILE + '/AppData/Roaming/npm/node_modules/csv-parser' )
var program = require( process.env.USERPROFILE + '/AppData/Roaming/npm/node_modules/commander' )

program
    .version( '0.0.1' )
    .description( 'Change PD player service status SQL generator' )
    .usage( ' ARGS' )
    .option( '--csvfile [csvfile]', 'CSV file or stdin of CONTRACT_IDENTITY,CONTRACT_ID,EMAIL_VERIFIED,SERVICE_TYPE_IDS,SERVICE_STATUS_IDS' )
    .option( '--sqlt [sqlt]', 'SQL template file' )
    .option( '--of [outputfile]', 'Write SQL to output file' )
    .option( '--report', 'Print players' )
    .parse( process.argv )

process.exitCode = 1

// if ( !program.sqlt )
// {
//     program.help()
//     process.exit()
// }

var sqlt
if ( program.sqlt )
{
    sqlt = require( path.resolve( program.sqlt ) )
}

var inputStream

if ( program.csvfile )
{
    inputStream = fs.createReadStream( program.csvfile )
}
else
{
    inputStream = process.stdin
}

const EMAIL_VERIFIED = 1
const PREACTIVE = 1
const ACTIVE = 2
const SUSPEND = 3
const CLOSED = 4
const COMPLETED = 5
var players = []

if ( program.report )
{
    console.log( '%s %s %s %s %s %s',
        'CONTRACT_IDENTITY', 'CONTRACT_ID', 'EMAIL_VERIFIED_Status', 'Portal_Service_Status', 'SC_Status', 'NEW_Status' )
}

inputStream
    .pipe( csv() )
    .on( 'data', function ( data )
    {
        var player = convertCsvRecordToPlayer( data )

        if (
            player.portalService == CLOSED
            || player.portalService == COMPLETED
            || player.secondChanceService == CLOSED
            || player.secondChanceService == COMPLETED
        )
        {
            return
        }

        player.newState = null

        if ( player.portalService == SUSPEND || player.secondChanceService == SUSPEND ) // 3, 5, 6, 7, 8, 10
        { player.newState = SUSPEND }
        else if ( player.emailVerified && player.portalService == PREACTIVE && player.secondChanceService == PREACTIVE ) // 1
        { player.newState = SUSPEND }
        else if ( player.emailVerified && player.portalService == PREACTIVE && player.secondChanceService == ACTIVE )  //  2
        { player.newState = ACTIVE }
        else if ( player.emailVerified && player.portalService == ACTIVE && player.secondChanceService == PREACTIVE )  //  4
        { player.newState = ACTIVE }
        else if ( !player.emailVerified && player.portalService == ACTIVE && player.secondChanceService == ACTIVE )  //  9
        { player.newState = PREACTIVE }

        if ( player.newState == ACTIVE || player.newState == PREACTIVE || player.newState == SUSPEND )
        {
            players.push( player )

            if ( program.report )
            {
                console.log( convertPlayerToFormattedString( player ) )
            }
        }
    } )
    .on( 'end', function ()
    {
        if ( sqlt )
        {
            generateSql( players, sqlt, sqlt.statements )
        }

        process.exitCode = 0
    } )

///////////////////////////////////////////////////////////////////////////////

function convertPlayerToFormattedString( player )
{
    var player2 = Object.assign( {}, player )

    player2.emailVerified = player2.emailVerified == 1 ? 'EMAIL_VERIFIED' : 'NOT_VERIFIED'
    if ( player2.portalService == ACTIVE ) { player2.portalService = 'ACTIVE' }
    if ( player2.portalService == SUSPEND ) { player2.portalService = 'SUSPEND' }
    if ( player2.portalService == PREACTIVE ) { player2.portalService = 'PREACTIVE' }

    if ( player2.secondChanceService == ACTIVE ) { player2.secondChanceService = 'ACTIVE' }
    if ( player2.secondChanceService == SUSPEND ) { player2.secondChanceService = 'SUSPEND' }
    if ( player2.secondChanceService == PREACTIVE ) { player2.secondChanceService = 'PREACTIVE' }

    if ( player2.newState == ACTIVE ) { player2.newState = 'ACTIVE' }
    if ( player2.newState == SUSPEND ) { player2.newState = 'SUSPEND' }
    if ( player2.newState == PREACTIVE ) { player2.newState = 'PREACTIVE' }

    var outputStr =
        player2.contractIdentity.toString().padStart( 17 )
        + player2.contractId.toString().padStart( 12 )
        + player2.emailVerified.toString().padStart( 22 )
        + player2.portalService.toString().padStart( 22 )
        + player2.secondChanceService.toString().padStart( 10 )
        + player2.newState.toString().padStart( 11 )
    return outputStr
}

function convertCsvRecordToPlayer( csvRecord )
{
    var player =
        {
            contractIdentity: csvRecord.CONTRACT_IDENTITY.trim(),
            contractLastUpdated: csvRecord.C_LAST_UPDATED.trim(),
            contractId: parseInt( csvRecord.CONTRACT_ID.trim() ),
            emailVerified: parseInt( csvRecord.EMAIL_VERIFIED.trim() ),
            customerContactsLastUpdated: csvRecord.CC_LAST_UPDATED.trim(),
            portalService: 0,
            secondChanceService: 0,
            customerServiceLastUpdated: csvRecord.CS_LAST_UPDATED.trim()
        }

    if ( csvRecord.SERVICE_STATUS_IDS.includes( ',' ) )
    {
        player.portalService = parseInt( csvRecord.SERVICE_STATUS_IDS.split( ',' )[0].trim() )
        player.secondChanceService = parseInt( csvRecord.SERVICE_STATUS_IDS.split( ',' )[1].trim() )
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
            sqlCode = sqlCode.replace( /contractLastUpdated/g, player.contractLastUpdated)
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
