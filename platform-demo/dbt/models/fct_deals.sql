select deal_id,owner_id,business_date,status,amount_cents,run_id
from {{ ref('silver_deals') }}
