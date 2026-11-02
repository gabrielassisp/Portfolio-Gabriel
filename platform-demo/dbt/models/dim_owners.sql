select distinct owner_id from {{ ref('silver_deals') }}
