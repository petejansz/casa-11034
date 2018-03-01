--PlayerPortalService = cs.service_type_id = 1 
--SecondChanceService  = cs.service_type_id = 500

--Preactive = cs.service_status_id = 1
--Active = cs.service_status_id = 2
--Suspended = cs.service_status_id = 3
--Closed  = cs.service_status_id = 4
--Completed  = cs.service_status_id = 5

--EmailVerified = cc.status = 1
--EmailNotVerified = cc.status = 0
select
contract_identity as CONTRACT_IDENTITY, 
contract_id as CONTRACT_ID, 
listagg(cast(service_type_id as varchar(3)), ', ') within group(order by service_type_id) AS service_type_ids,
listagg(cast(service_status_id as varchar(3)), ', ') within group(order by service_status_id) AS service_status_ids
from (
	select
	c.contract_identity as CONTRACT_IDENTITY, 
	cs.contract_id as CONTRACT_ID, 
	cast(cs.service_type_id as varchar(3)) as service_type_id,
	cast(cs.service_status_id as varchar(3)) as service_status_id
	from gms4.sms_customer_services cs
		inner join gms4.sms_customer_contacts cc on cc.contract_id = cs.contract_id
		inner join gms4.sms_contracts c on c.contract_id = cc.contract_id
		where cs.service_type_id IN ( 1, 500 )    -- PP or SC
		AND cs.service_status_id = 3  -- suspended
		OR cc.status = 1 AND cc.contact_type_id = 1    -- emailverified
		AND cs.service_type_id = 1      -- PP
		AND cs.service_status_id = 1    -- preactive             
	group by c.contract_identity, cs.contract_id, cs.service_type_id, cs.service_status_id
	)
group by contract_identity, contract_id