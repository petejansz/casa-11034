-- Find player candidates to change to Preactive

--PlayerPortalService = cs.service_type_id = 1 
--SecondChanceService  = cs.service_type_id = 500

--Preactive = cs.service_status_id = 1
--Active = cs.service_status_id = 2
--Suspended = cs.service_status_id = 3

--EmailVerified = cc.status = 1
--EmailNotVerified = cc.status = 0

select   c.contract_identity, cs.contract_id, cs.service_type_id, cs.service_status_id, cs.last_updated
from    gms4.sms_customer_services cs
inner join gms4.sms_customer_contacts cc on cc.contract_id = cs.contract_id
inner join gms4.sms_contracts c on c.contract_id = cc.contract_id
where   cc.status = 0 AND cs.service_type_id = 1 AND cs.service_status_id = 2
group by  c.contract_identity, cs.contract_id, cs.service_type_id, cs.service_status_id, cs.last_updated
