with ranked as (
  select *,row_number() over (partition by record_id order by (payload->>'version')::integer desc,seq desc) as priority
  from {{ ref('stg_records') }} where is_valid is true and source='chats'
)
select record_id as chat_id,payload->>'deal_id' as deal_id,(payload->>'messages')::integer as messages,(payload->>'business_date')::date as business_date,run_id
from ranked where priority=1
