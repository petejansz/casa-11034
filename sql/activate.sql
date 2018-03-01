-- Find contract_id to activate
--PlayerPortalService = cs.service_type_id = 1 
--SecondChanceService  = cs.service_type_id = 500
--Preactive = cs.service_status_id = 1
--Active = cs.service_status_id = 2
--Suspended = cs.service_status_id = 3
--EmailVerified = cc.status = 1
--EmailNotVerified = cc.status = 0

--update gms4.sms_customer_services
--set service_status_id = 2, last_updated = current timestamp
select contract_id, service_type_id, service_status_id from sms_customer_services
where contract_id in
(
    select  distinct cs.contract_id 
    from    gms4.sms_customer_services cs
    inner join gms4.sms_customer_contacts cc on cc.contract_id = cs.contract_id 
    where   cc.status = 1 AND cs.service_type_id = 1 AND cs.service_status_id = 1
)