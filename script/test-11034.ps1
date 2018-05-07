param
(
    [switch]    $getplayers,
    [string]    $system,
    [switch]    $genServiceCsvfile,
    [switch]    $report,
    [switch]    $update,
    [switch]    $help,
    [switch]    $h
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
Set-PSDebug -Off #-Trace 2
$whereWasI = $pwd

trap [Exception]
{
    [Console]::Error.WriteLine($_.Exception);
    Set-Location $whereWasI
}

$ScriptName = $MyInvocation.MyCommand.Name
$ScriptDir = Split-Path $MyInvocation.MyCommand.Path

function showHelp()
{
    Write-Output "USAGE: $ScriptName [option] -system <cat1 | cat2 | apl | dev>"
    Write-Output "  option"
    Write-Output "    -getplayers                             # Get all players to {system}-all.csv"
    Write-Output "    -genServiceCsvfile {system}-updateservice.csv # Generate PD updateservice csv file"
    Write-Output "    -update - Perform Updates"
    Write-Output "    -report - ch-pd-service-status --report"
    exit 1
}

function doUpdates($dbCon, $sqlFileName)
{
    Write-Host "$system : Updating player service state..."
    dbviscmd -connection $dbCon -stoponerror -sqlfile $sqlFileName | out-null
    if ($? -eq $False) {exit 1}
}

function isEmailVerified( $pdAdminHost, $contractIdentity)
{
    $perObj = pd2-admin --api per --host $pdAdminHost --playerid $contractIdentity | convertfrom-json
    return $perObj.emails[0].verified
}

function genServiceCsvfile()
{
    Write-Host "ch-pd-service-status.js --csvfile ${system}-all.csv --service-csv ${system}-updateservice.csv"
    $reportArg = ""
    if ($report) {$reportArg = "--report"}
    ch-pd-service-status.js --csvfile ${system}-all.csv --service-csv "${system}-updateservice.csv" $reportArg
    if ($? -eq $False) {exit 1}
}
function generateSqlFiles()
{
    foreach ($sqlJsFile in (ls ../script/*.sql.js))
    {
        $sqlFileName = $sqlJsFile.name -replace "\.js$", ''
        $fullSqlJsFilename = ${sqlJsFile}.Fullname

        Write-Host "ch-pd-service-status.js --csvfile ${system}-all.csv --sqlt $fullSqlJsFilename --of $sqlFileName"
        ch-pd-service-status.js --csvfile ${system}-all.csv --sqlt $fullSqlJsFilename --of $sqlFileName
        if ($? -eq $False) {exit 1}

        if ($update)
        {
            doUpdates $dbCon $sqlFileName
        }

        $contractIdentityList = grep "contract_identity" $sqlFileName | ForEach-Object {$_.split()[3] -replace ',', ''}

        foreach ($contractIdentity in $contractIdentityList)
        {
            $emailVerified = isEmailVerified $pdAdminHost $contractIdentity
            $proObj = pd2-admin --api pro --host $pdAdminHost --playerid $contractIdentity | ConvertFrom-Json
            $playerState = "{0} {1} {2} {3} {4} {5}" -f `
                $contractIdentity, `
                $emailVerified, `
                $proObj.services[0].serviceType, $proObj.services[0].status, `
                $proObj.services[1].serviceType, $proObj.services[1].status
            Write-Host $playerState
        }
    }
}

if ($h -or $help) {showHelp}
if ( $system -and $system -match "apl|cat1|cat2|dev|localhost" ) { } else {showHelp}

$projectDir = (resolve-path "${ScriptDir}/..").ToString()

$pdAdminHost = $system
$env:PATH = "$projectDir\script;$env:PATH"
Set-Location "$projectDir\$system"

if ($system -match "^dev$")
{
    $dbCon = "ca-pd-${system}"
    Write-Host "Testing $system , $dbCon ..."
    Write-Host "$system : Reseting service status on player accounts..."
    exec-sql -con $dbCon -sqlfile "reset-${system}-scenarios.sql" | out-null
    if ($? -eq $False) {exit 1}
}
else
{
    $dbCon = 'Tunnel-DB'
}

if ($getplayers)
{
    Write-Host "$system : Getting all players, service status..."
    exec-sql -con $dbCon -sqlfile "${projectDir}/sql/ls-all-player-emailverfied-service-state.sql" -exportFile "${system}-all.csv" | out-null
    if ($? -eq $False) {exit 1}
}

if ($genServiceCsvfile)
{
    genServiceCsvfile
}