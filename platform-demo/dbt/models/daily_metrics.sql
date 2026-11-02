with deals as (
  select business_date,count(*) as deals,
    sum(case when status='won' then amount_cents else 0 end) as won_amount_cents
  from {{ ref('fct_deals') }} group by business_date
), chats as (
  select business_date,count(*) as chats from {{ ref('silver_chats') }} group by business_date
), ads as (
  select business_date,sum(spend_cents) as spend_cents,sum(leads) as leads
  from {{ ref('silver_ads') }} group by business_date
)
select a.business_date,coalesce(d.deals,0) as deals,coalesce(d.won_amount_cents,0) as won_amount_cents,
       coalesce(c.chats,0) as chats,a.spend_cents,a.leads
from ads a left join deals d using(business_date) left join chats c using(business_date)
