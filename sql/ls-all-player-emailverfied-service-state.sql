--!!! UNCOMMENT THE EXPORT STATEMENT !!!
--EXPORT TO all-player-status.del OF DEL

select
    CONTRACT_IDENTITY,
    ACCOUNT_EMAIL,
    CONTRACT_ID,
    EMAIL_VERIFIED,
    listagg(cast(service_type_id as varchar(3)), ', ')   as service_type_ids,
    listagg(cast(service_status_id as varchar(3)), ', ') as service_status_ids
from (
    select
    c.contract_identity as CONTRACT_IDENTITY,
    cc.value AS ACCOUNT_EMAIL,
    cs.contract_id as CONTRACT_ID,
    cc.status  as EMAIL_VERIFIED,
    cast(cs.service_type_id as varchar(3)) as SERVICE_TYPE_ID,
    cast(cs.service_status_id as varchar(3)) as SERVICE_STATUS_ID
    from GMS4.sms_customer_services cs
        inner join GMS4.sms_customer_contacts cc on cc.contract_id = cs.contract_id
        inner join GMS4.sms_contracts c on c.contract_id = cc.contract_id
        where
            c.contract_status_id != 6 and -- hidden
            cc.contact_type_id = 1 and
            cs.service_type_id in ( 1, 500 )    -- PP or SC

    group by c.contract_identity, cc.value, cs.contract_id, cc.status, cs.service_type_id, cs.service_status_id
    )
group by contract_identity, ACCOUNT_EMAIL, contract_id, email_verified
order by account_email
;
