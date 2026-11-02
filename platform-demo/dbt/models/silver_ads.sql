with ranked as (
  select *,row_number() over (partition by record_id order by (payload->>'version')::integer desc,seq desc) as priority
  from {{ ref('stg_records') }} where is_valid is true and source='ads'
)
select record_id as ad_id,(payload->>'spend_cents')::bigint as spend_cents,(payload->>'leads')::integer as leads,(payload->>'business_date')::date as business_date,run_id
from ranked where priority=1
