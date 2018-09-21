param
(
    [string]    $serviceCsvfile,
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
    Write-Output "USAGE: $ScriptName -servicecsvfile <filename>"
    exit 1
}

$scenarios = cat scenarios.csv
Write-Output ("{0}  {1}" -f "SCENARIO", "COUNT")
foreach ($line in $scenarios)
{
    if ($line -match "^[0-9]{1,2},[0-9]{1},[0-9]{1},[0-9]{1}$")
    {
        $scenario = $line.split(',')[0]
        $searchPattern = $line -replace "^[0-9]{1,2},", ''
        $count = grep -c $searchPattern $serviceCsvfile
        #"{0,8}  {1,5}" -f $scenario, $count
        $count
    }
}