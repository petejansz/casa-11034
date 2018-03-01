var activateUpdateStatements = "-- Activate(2) contract_identity: contractIdentity, contract_id: contractId \n"
activateUpdateStatements += "update gms4.sms_customer_services set service_status_id = 2, last_updated = current timestamp where contract_id = contractId AND service_type_id IN ( 1, 500 ) and 'customerServiceLastUpdated' = date(last_updated);\n"
activateUpdateStatements += "update gms4.sms_customer_contacts set status = 1, last_updated = current timestamp where contract_id = contractId and 'customerContactsLastUpdated' = date(last_updated); \n"
activateUpdateStatements += "update gms4.sms_contracts set last_updated = current timestamp where contract_id = contractId and 'contractLastUpdated' = date(last_updated); \n"
activateUpdateStatements += "commit;\n"

var sqlt =
{
    description: 'CASA-11034: out-of-sync',
    serviceStatus: 2,
    statements: [activateUpdateStatements]
}

module.exports = sqlt;