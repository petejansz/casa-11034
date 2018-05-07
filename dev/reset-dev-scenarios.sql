-- Scenario 1, 1000006105,test11@yopmail.com
update gms4.sms_customer_services set service_status_id = 1, last_updated = current timestamp
where contract_id = 6106 AND service_type_id IN ( 1 );

update gms4.sms_customer_services set service_status_id = 1, last_updated = current timestamp
where contract_id = 6106 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts set status = 1, last_updated = current timestamp
where contract_id = 6106;

update gms4.sms_contracts set last_updated = current timestamp
where contract_id = 6106;
commit;

-- Scenario 2, 1000006106,test12@yopmail.com
update gms4.sms_customer_services set service_status_id = 1, last_updated = current timestamp
where contract_id = 6107 AND service_type_id IN ( 1 );

update gms4.sms_customer_services set service_status_id = 2, last_updated = current timestamp
where contract_id = 6107 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts set status = 1, last_updated = current timestamp
where contract_id = 6107;

update gms4.sms_contracts set last_updated = current timestamp
where contract_id = 6107;
commit;

-- Scenario 3, 1000004934,test13@yopmail.com
update gms4.sms_customer_services set service_status_id = 3, last_updated = current timestamp
where contract_id = 4937 AND service_type_id IN ( 1 );

update gms4.sms_customer_services set service_status_id = 1, last_updated = current timestamp
where contract_id = 4937 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts set status = 0, last_updated = current timestamp
where contract_id = 4937;

update gms4.sms_contracts set last_updated = current timestamp
where contract_id = 4937;
commit;

-- Scenario 4, 1000004935,test14@yopmail.com
update gms4.sms_customer_services set service_status_id = 2, last_updated = current timestamp
where contract_id = 4938 AND service_type_id IN ( 1 );

update gms4.sms_customer_services set service_status_id = 1, last_updated = current timestamp
where contract_id = 4938 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts set status = 1, last_updated = current timestamp
where contract_id = 4938;

update gms4.sms_contracts set last_updated = current timestamp
where contract_id = 4938;
commit;

-- Scenario 5, 1000004936,test15@yopmail.com
update gms4.sms_customer_services set service_status_id = 3, last_updated = current timestamp
where contract_id = 4939 AND service_type_id IN ( 1 );

update gms4.sms_customer_services set service_status_id = 1, last_updated = current timestamp
where contract_id = 4939 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts set status = 1, last_updated = current timestamp
where contract_id = 4939;

update gms4.sms_contracts set last_updated = current timestamp
where contract_id = 4939;
commit;

-- Scenario 6, 1000004937,test16@yopmail.com
update gms4.sms_customer_services set service_status_id = 1, last_updated = current timestamp
where contract_id = 4940 AND service_type_id IN ( 1 );

update gms4.sms_customer_services set service_status_id = 3, last_updated = current timestamp
where contract_id = 4940 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts set status = 1, last_updated = current timestamp
where contract_id = 4940;

update gms4.sms_contracts set last_updated = current timestamp
where contract_id = 4940;
commit;

-- Scenario 7, 1000004938,test17@yopmail.com
update gms4.sms_customer_services set service_status_id = 2, last_updated = current timestamp
where contract_id = 4941 AND service_type_id IN ( 1 );

update gms4.sms_customer_services set service_status_id = 3, last_updated = current timestamp
where contract_id = 4941 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts set status = 1, last_updated = current timestamp
where contract_id = 4941;

update gms4.sms_contracts set last_updated = current timestamp
where contract_id = 4941;
commit;

-- Scenario 8, 1000004940,test18@yopmail.com
update gms4.sms_customer_services set service_status_id = 3, last_updated = current timestamp
where contract_id = 4943 AND service_type_id IN ( 1 );

update gms4.sms_customer_services set service_status_id = 2, last_updated = current timestamp
where contract_id = 4943 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts set status = 1, last_updated = current timestamp
where contract_id = 4943;

update gms4.sms_contracts set last_updated = current timestamp
where contract_id = 4943;
commit;

-- Scenario 9, 1000004941,test19@yopmail.com
update gms4.sms_customer_services set service_status_id = 2, last_updated = current timestamp
where contract_id = 4944 AND service_type_id IN ( 1 );

update gms4.sms_customer_services set service_status_id = 2, last_updated = current timestamp
where contract_id = 4944 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts set status = 0, last_updated = current timestamp
where contract_id = 4944;

update gms4.sms_contracts set last_updated = current timestamp
where contract_id = 4944;
commit;

-- Scenario 10, 1000006107,testa@yopmail.com
update gms4.sms_customer_services set service_status_id = 3, last_updated = current timestamp
where contract_id = 6108 AND service_type_id IN ( 1 );

update gms4.sms_customer_services set service_status_id = 3, last_updated = current timestamp
where contract_id = 6108 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts set status = 1, last_updated = current timestamp
where contract_id = 6108;

update gms4.sms_contracts set last_updated = current timestamp
where contract_id = 6108;
commit;

-- Scenario 11, verfified/active/active - ignore/don't process 1000006108, testb@yopmail.com
update gms4.sms_customer_services set service_status_id = 2, last_updated = current timestamp
where contract_id = 6109 AND service_type_id IN ( 1 );

update gms4.sms_customer_services set service_status_id = 2, last_updated = current timestamp
where contract_id = 6109 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts set status = 1, last_updated = current timestamp
where contract_id = 6109;

update gms4.sms_contracts set last_updated = current timestamp
where contract_id = 6109;
commit;

-- Scenario 12, not_verfified/preactive/preactive - ignore/don't process 1000006109, testc@yopmail.com
update gms4.sms_customer_services set service_status_id = 1, last_updated = current timestamp
where contract_id = 6110 AND service_type_id IN ( 1 );

update gms4.sms_customer_services set service_status_id = 1, last_updated = current timestamp
where contract_id = 6110 AND service_type_id IN ( 500 );

update gms4.sms_customer_contacts set status = 0, last_updated = current timestamp
where contract_id = 6110;

update gms4.sms_contracts set last_updated = current timestamp
where contract_id = 6110;
commit;
