with ranked as (
  select *,row_number() over (partition by record_id order by (payload->>'version')::integer desc,seq desc) as priority
  from {{ ref('stg_records') }} where is_valid is true and source='deals'
)
select record_id as deal_id,payload->>'owner_id' as owner_id,(payload->>'amount_cents')::bigint as amount_cents,payload->>'status' as status,(payload->>'business_date')::date as business_date,(payload->>'version')::integer as source_version,run_id
from ranked where priority=1
