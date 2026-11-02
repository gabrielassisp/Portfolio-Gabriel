{{ config(materialized='incremental', unique_key='deal_id', incremental_strategy='delete+insert', on_schema_change='fail') }}
select incoming.deal_id,incoming.owner_id,incoming.business_date,incoming.status,
       incoming.amount_cents,incoming.source_version,incoming.run_id
from {{ ref('silver_deals') }} incoming
{% if is_incremental() %}
left join {{ this }} existing on incoming.deal_id=existing.deal_id
where existing.deal_id is null or incoming.source_version > existing.source_version
{% endif %}
