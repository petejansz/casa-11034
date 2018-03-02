#!/bin/sh

SQL_FILE=$1
USER=$USER
PWD=$USER
db2 connect to GMS4 user $USER using $PWD
db2 -stf $SQL_FILE
echo 'CONTRACT_IDENTITY,C_LAST_UPDATED,CONTRACT_ID,EMAIL_VERIFIED,CC_LAST_UPDATED,SERVICE_TYPE_IDS,SERVICE_STATUS_IDS,CS_LAST_UPDATED' > temp.csv
cat all-player-status.csv >> temp.csv
mv -f temp.csv all-player-status.csv
