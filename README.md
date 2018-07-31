The process:

On CAB2CDB1, prod-ops runs an SQL script (provided by us), which exports to a CSV file all players accounts, not hidden, with PP/SC services.
Using the all-players CSV file, we generate a PD Batch, updateservice.csv file.
On CACRMCOREA1, prod-ops runs the PD Batch updateservice with the updateservice.csv file, https://wiki.gtech.com/display/PD/CAPD+batch+jobs
