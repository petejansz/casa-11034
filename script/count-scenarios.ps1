<#
    Count, report CA batch updateservice CSV file
#>

param
(
    [string]    $serviceCsvfile,
    [switch]    $csv,
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
    Write-Output "USAGE: $ScriptName [-csv] -servicecsvfile <filename>"
    exit 1
}

if ($h -or $help) {showHelp}

$scenarios = Get-Content scenarios.csv
$format = "{0,8}  {1,5}`n"

if ($csv) { $format = "{0},{1}`n" }

$outText = ($format -f "SCENARIO", "COUNT")

foreach ($line in $scenarios)
{
    if ($line -match "^[0-9]{1,2},[0-9]{1},[0-9]{1},[0-9]{1}$")
    {
        $scenario = $line.split(',')[0]
        $searchPattern = $line -replace "^[0-9]{1,2},", ''
        $count = grep -c $searchPattern $serviceCsvfile
        $outText += ($format -f $scenario, $count)
    }
}

Write-Output $outText