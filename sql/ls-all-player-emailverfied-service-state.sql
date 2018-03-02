--!!! UNCOMMENT THE EXPORT STATEMENT !!!
--EXPORT TO all-player-status.csv OF DEL

select
    CONTRACT_IDENTITY,
    C_LAST_UPDATED,
    CONTRACT_ID,
    EMAIL_VERIFIED,
    CC_LAST_UPDATED,
    listagg(cast(service_type_id as varchar(3)), ', ') within group(order by service_type_id) as service_type_ids,
    listagg(cast(service_status_id as varchar(3)), ', ') within group(order by service_status_id) as service_status_ids,
    CS_LAST_UPDATED
from (
	select
	c.contract_identity as CONTRACT_IDENTITY,
	to_char(date(c.last_updated), 'YYYY-MM-DD') as C_LAST_UPDATED,
	cs.contract_id as CONTRACT_ID,
	cc.status  as EMAIL_VERIFIED,
	to_char(date(cc.last_updated), 'YYYY-MM-DD') as CC_LAST_UPDATED,
	cast(cs.service_type_id as varchar(3)) as SERVICE_TYPE_ID,
	cast(cs.service_status_id as varchar(3)) as SERVICE_STATUS_ID,
	to_char(date(cs.last_updated), 'YYYY-MM-DD') as CS_LAST_UPDATED
	from gms4.sms_customer_services cs
		inner join gms4.sms_customer_contacts cc on cc.contract_id = cs.contract_id
		inner join gms4.sms_contracts c on c.contract_id = cc.contract_id
		where
            c.contract_status_id != 6 and -- hidden
		    cc.contact_type_id = 1 and
            cs.service_type_id in ( 1, 500 )    -- PP or SC
            
	group by c.contract_identity, c.last_updated, cs.contract_id, cc.status, cc.last_updated, cs.service_type_id, cs.service_status_id, cs.last_updated 
	)
group by contract_identity, C_LAST_UPDATED, contract_id, email_verified, CC_LAST_UPDATED, CS_LAST_UPDATED
;
