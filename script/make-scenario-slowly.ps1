param
(
    [string]    $inServiceFile,
    [string]    $outServiceFile,
    [switch]    $help,
    [switch]    $h
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
Set-PSDebug -Off #-Trace 2
$whereWasI = $pwd

trap [Exception]
{
    [Console]::Error.WriteLine($_.Exception)
    Set-Location $whereWasI
}

$ScriptName = $MyInvocation.MyCommand.Name
$ScriptDir = Split-Path $MyInvocation.MyCommand.Path

function showHelp()
{
    Write-Output "USAGE: $ScriptName -inServiceFile <filename> -outServiceFile <filename>"
    exit 1
}

if ($h -or $help) {showHelp}
if ((-not($inServiceFile)) -or (-not($inServiceFile))) {showHelp}

$findScenario = ',3,3,0$'
$MAXScenarioCount = 884199
$replaceScenario = ',1,1,1'
$replacedCount = 0
"Start @ {0}" -f ( Get-Date )
$inContent = Get-Content $inServiceFile
$outContent = @()
foreach ($line in $inContent)
{
    if ($replacedCount -le $MAXScenarioCount -and $line -match $findScenario)
    {
        $line = $line -replace $findScenario, $replaceScenario
        $replacedCount++
    }

    $outContent += $line
    $dt = Get-Date
    if ($replacedCount -ne 0 -and $replacedCount % 1000 -eq 0) { Write-Host "$dt replaced: $replacedCount" }
}

$outContent | Out-file -Encoding UTF8 -NoClobber -Append $outServiceFile
