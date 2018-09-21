$scenarios = cat scenarios.csv
foreach ($line in scenarios)
{
    $scenario =  -replace "^[0-9]{1,2},", ''
}