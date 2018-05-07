-- Activate(2)
update gms4.sms_customer_services
set service_status_id = 1, last_updated = current timestamp
where contract_id = 1 AND service_type_id IN ( 1 );

update gms4.sms_customer_services
set service_status_id = 2, last_updated = current timestamp
where contract_id = 1 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts
set status = 1, last_updated = current timestamp
where contract_id = 1;

update gms4.sms_contracts
set last_updated = current timestamp
where contract_id = 1;

commit;

-- Activate(2)
update gms4.sms_customer_services
set service_status_id = 1, last_updated = current timestamp
where contract_id = 2 AND service_type_id IN ( 1 );

update gms4.sms_customer_services
set service_status_id = 2, last_updated = current timestamp
where contract_id = 2 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts
set status = 1, last_updated = current timestamp
where contract_id = 2;

update gms4.sms_contracts
set last_updated = current timestamp
where contract_id = 2;

commit;

-- Activate(2)
update gms4.sms_customer_services
set service_status_id = 1, last_updated = current timestamp
where contract_id = 22 AND service_type_id IN ( 1 );

update gms4.sms_customer_services
set service_status_id = 2, last_updated = current timestamp
where contract_id = 22 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts
set status = 1, last_updated = current timestamp
where contract_id = 22;

update gms4.sms_contracts
set last_updated = current timestamp
where contract_id = 22;

commit;

-- Activate(2)
update gms4.sms_customer_services
set service_status_id = 1, last_updated = current timestamp
where contract_id = 41 AND service_type_id IN ( 1 );

update gms4.sms_customer_services
set service_status_id = 2, last_updated = current timestamp
where contract_id = 41 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts
set status = 1, last_updated = current timestamp
where contract_id = 41;

update gms4.sms_contracts
set last_updated = current timestamp
where contract_id = 41;

commit;

update gms4.sms_customer_services
set service_status_id = 1, last_updated = current timestamp
where contract_id = 6019 AND service_type_id IN ( 1 );

update gms4.sms_customer_services
set service_status_id = 2, last_updated = current timestamp
where contract_id = 6019 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts
set status = 1, last_updated = current timestamp
where contract_id = 6019;

update gms4.sms_contracts
set last_updated = current timestamp
where contract_id = 6019;

commit;


-- Activate(2) contract_identity: 1000006020, contract_id: 6021
update gms4.sms_customer_services
set service_status_id = 2, last_updated = current timestamp
where contract_id = 6021 AND service_type_id IN ( 1 );

update gms4.sms_customer_services
set service_status_id = 1, last_updated = current timestamp
where contract_id = 6021 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts
set status = 1, last_updated = current timestamp
where contract_id = 6021;

update gms4.sms_contracts
set last_updated = current timestamp
where contract_id = 6021;

commit;
