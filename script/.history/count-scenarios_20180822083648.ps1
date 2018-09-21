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
foreach ($line in $scenarios)
{
    $scenario = $line.split(',')[0]
    $searchPattern = $line -replace "^[0-9]{1,2},", ''
    grep -c $searchPattern $serviceCsvfile
}