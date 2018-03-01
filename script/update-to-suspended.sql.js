var suspendUpdateStatements = "-- Suspend contract_identity: contractIdentity, contract_id: contractId \n"
suspendUpdateStatements += "update gms4.sms_customer_services set service_status_id = 3, last_updated = current timestamp \n"
suspendUpdateStatements += "where contract_id = contractId AND service_type_id IN ( 1, 500 ) and 'customerServiceLastUpdated' = date(last_updated); \n"

suspendUpdateStatements += "update gms4.sms_customer_contacts set status = 0, last_updated = current timestamp where contract_id = contractId and 'customerContactsLastUpdated' = date(last_updated); \n"

suspendUpdateStatements += "update gms4.sms_contracts set last_updated = current timestamp where contract_id = contractId and 'contractLastUpdated' = date(last_updated); commit;\n"

var sqlt =
{
    description: 'CASA-11034: out-of-sync',
    serviceStatus: 3,
    statements: [suspendUpdateStatements]
}

module.exports = sqlt;