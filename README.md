The process:

1. On CAB2CDB, prod-ops runs ls-all-player-emailverfied-service-state.sql, which exports to a CSV file of all player accounts, not hidden, with PP/SC services.
2. Using the all-players CSV file, we generate a PD Batch, updateservice.csv file.
2.1  ch-pd-service-status.js  --csvfile [csvfile]  --service-csv ca_update_prod.csv --report
3. On CACRMCOREA1, Ops "drops" ca_update_prod.csv into /etc/gtech/capd/updateservice. The Update user service status process processes the file. (https://wiki.gtech.com/display/PD/CAPD+batch+jobs)
