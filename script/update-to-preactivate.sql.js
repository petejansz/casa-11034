var preactivateUpdateStatements = "-- Preactivate(1) contract_identity: contractIdentity, contract_id: contractId \n"
preactivateUpdateStatements += "update gms4.sms_customer_services set service_status_id = 1, last_updated = current timestamp \n"
preactivateUpdateStatements += "where contract_id = contractId AND service_type_id IN ( 1, 500 ) and 'customerServiceLastUpdated' = date(last_updated); \n"

preactivateUpdateStatements += "update gms4.sms_customer_contacts \n"
preactivateUpdateStatements += "set status = 0, last_updated = current timestamp \n"
preactivateUpdateStatements += "where contract_id = contractId and 'customerContactsLastUpdated' = date(last_updated); \n"

preactivateUpdateStatements += "update gms4.sms_contracts set last_updated = current timestamp \n"
preactivateUpdateStatements += "where contract_id = contractId and 'contractLastUpdated' = date(last_updated); \n"
preactivateUpdateStatements += "commit; \n"

var sqlt =
{
    description: 'CASA-11034: out-of-sync',
    serviceStatus: 1,
    statements: [preactivateUpdateStatements]
}

module.exports = sqlt;