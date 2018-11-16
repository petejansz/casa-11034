
 -- Update PP service:
update GMS4.sms_customer_services
    set service_status_id = 3
    where contract_id = (select cc.contract_id from GMS4.sms_customer_contacts cc where cc.value = 'test22@yopmail.com' and cc.contact_type_id = 1)
    AND service_type_id = 1
;

 -- Update SC service:
update GMS4.sms_customer_services
    set service_status_id = 3
    where contract_id = (select cc.contract_id from GMS4.sms_customer_contacts cc where cc.value = 'test22@yopmail.com' and cc.contact_type_id = 1)
    AND service_type_id = 500
;

-- Update email verified:
update GMS4.sms_customer_contacts
    set status = 0 
    where contract_id = (select cc.contract_id from GMS4.sms_customer_contacts cc where cc.value = 'test22@yopmail.com' and cc.contact_type_id = 1)
;    

commit;
