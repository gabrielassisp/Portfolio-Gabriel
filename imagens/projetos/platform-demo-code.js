export const publicPlatformExample = {
  "title": "Modelo fato da demonstração pública Postgres/dbt",
  "explanation": "Código real do laboratório Docker Compose com dados fictícios. A plataforma profissional permanece privada.",
  "language": "SQL / dbt",
  "startLine": 1,
  "href": "https://github.com/gabrielassisp/Portfolio-Gabriel/blob/main/platform-demo/dbt/models/fct_deals.sql",
  "source": "platform-demo/dbt/models/fct_deals.sql",
  "code": "select deal_id,owner_id,business_date,status,amount_cents,run_id\nfrom {{ ref('silver_deals') }}\n"
};
