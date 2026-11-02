select deal_id from {{ ref('silver_deals') }}
where deal_id in ('d0000','d0001','d0002') and (amount_cents <> 20000 or status <> 'won')
