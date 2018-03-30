# CASA-11034
1.	Get all players service state into ${system}-all.csv
  a.  Run scripts/test-11034 -system cat1 -getplayers
2.  Generate SQL update scripts from ${system}-all.csv, producing update-to-activate.sql, update-to-preactivate.sql and update-to-suspended.sql
  a. Run scripts/test-11034 -system cat1 -gensql
  b.1  ch-pd-service-status --csvfile ${system}-all.csv --sqlt $fullSqlJsFilename --of $sqlFileName
  b.1.1  Example, ch-pd-service-status --csvfile cat1/cat1-all.csv --sqlt C:/Users/pjansz/Documents/MyProjects/igt/pd/casa-11034/script/update-to-activate.sql.js
 --of cat1/cat1/update-to-activate.sql
3.	Run the SQL.
