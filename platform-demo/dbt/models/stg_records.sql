{{ config(materialized='view') }}
select *,
  case
    when record_id = '' then false
    when source = 'deals' then
      record_id ~ '^d[0-9]{4}$' and payload->>'owner_id' ~ '^o[0-9]{2}$'
      and payload->>'amount_cents' ~ '^[0-9]+$' and payload->>'status' in ('won','open')
    when source = 'history' then
      record_id ~ '^h[0-9]{4}$' and payload->>'deal_id' ~ '^d[0-9]{4}$'
      and payload->>'stage' in ('qualified','won')
    when source = 'chats' then
      record_id ~ '^c[0-9]{4}$' and payload->>'deal_id' ~ '^d[0-9]{4}$'
      and payload->>'messages' ~ '^[0-9]+$'
    when source = 'ads' then
      record_id ~ '^a[0-9]{4}$' and payload->>'spend_cents' ~ '^[0-9]+$'
      and payload->>'leads' ~ '^[0-9]+$'
    else false
  end as is_valid
from {{ source('bronze','raw_records') }}
