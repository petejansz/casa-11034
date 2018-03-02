param
(
    [string]    $system,
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
function showHelp()
{
    Write-Output "USAGE: $ScriptName [option] -system <cat1 | cat2 | apl | dev>"
    Write-Output "  option"
    exit 1
}

if ($h -or $help) {showHelp}
if ( $system -and $system -match "cat1|cat2|apl|dev" ) { } else {showHelp}

$projectDir = "$env:USERPROFILE\Documents\MyProjects\igt\pd\casa-11034"

$pdAdminHost = 'pdadmin'
$env:PATH = "$projectDir\script;$env:PATH"
cd "$projectDir\$system"

if ($system -match "^dev$")
{
    $dbCon = 'ca-pd-dev'
    Write-Host "Testing $system , $dbCon ..."
    Write-Host "$system : Reseting service status on player accounts..."
    exec-sql -con $dbCon -sqlfile reset-dev-update-activate.sql  | out-null
    exec-sql -con $dbCon -sqlfile reset-dev-update-preactivate.sql | out-null
    exec-sql -con $dbCon -sqlfile reset-dev-update-suspended.sql | out-null
    if ($? -eq $False) {exit 1}
}
else
{
    $dbCon = 'Tunnel-DB'
}

Write-Host "$system : Getting all players, service status..."
exec-sql -con $dbCon -sqlfile "../sql/ls-all-player-emailverfied-service-state.sql" -exportFile "dev-all.csv" | out-null
if ($? -eq $False) {exit 1}

foreach ($sqlJsFile in (ls ../script/*.sql.js))
{
    $sqlFileName = $sqlJsFile.name -replace "\.js$", ''
    $fullSqlJsFilename = ${sqlJsFile}.Fullname

    Write-Host "ch-pd-service-status.js --csvfile dev-all.csv --sqlt $fullSqlJsFilename --of $sqlFileName"
    ch-pd-service-status.js --csvfile dev-all.csv --sqlt $fullSqlJsFilename --of $sqlFileName
    if ($? -eq $False) {exit 1}

    Write-Host "$system : Updating player service state..."
    dbviscmd -connection $dbCon -stoponerror -sqlfile $sqlFileName | out-null
    if ($? -eq $False) {exit 1}

    $contractIdentityList = grep "contract_identity" $sqlFileName | ForEach-Object {$_.split()[3] -replace ',', ''}

    foreach ($contractIdentity in $contractIdentityList)
    {
        $profObj =        admin-players-profile -m pro -h $pdAdminHost -i $contractIdentity | ConvertFrom-Json
        $emailVerified = (admin-players-profile -m per -h $pdAdminHost -i $contractIdentity | convertfrom-json).emails[0].verified
        $playerState = "{0} {1} {2} {3} {4} {5}" -f $contractIdentity, `
         $emailVerified, `
         $profObj.services[0].serviceType, $profObj.services[0].status, `
         $profObj.services[1].serviceType, $profObj.services[1].status
        Write-Host $playerState
    }
}