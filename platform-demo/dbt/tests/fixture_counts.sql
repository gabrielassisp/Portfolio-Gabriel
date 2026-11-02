select 'unexpected_counts' as failure
where (select count(*) from {{ source('bronze','raw_records') }}) <> 1844
   or (select count(*) from {{ ref('silver_deals') }}) <> 400
   or (select count(*) from {{ ref('silver_history') }}) <> 800
   or (select count(*) from {{ ref('silver_chats') }}) <> 600
   or (select count(*) from {{ ref('silver_ads') }}) <> 30
   or (select count(*) from {{ ref('rejected_records') }}) <> 4
