// Trechos extraídos dos arquivos reais dos projetos.
export const codeExamples = {
  "plataforma": {
    "title": "Modelo incremental e padronização no dbt",
    "language": "SQL / Jinja",
    "explanation": "Configuração real do modelo Silver: chave única, estratégia incremental e normalização de campos de negócio.",
    "source": "etl/dbt/asf_data/models/silver/zoho/deals_zoho.sql",
    "href": "https://github.com/gabrielassisp/etl-python-dbt/blob/main/etl/dbt/asf_data/models/silver/zoho/deals_zoho.sql#L1-L16",
    "startLine": 1,
    "code": "{{ config(\n    materialized='incremental',\n    incremental_strategy='delete+insert',\n    unique_key='deal_id',\n    full_refresh=false,\n    on_schema_change='fail',\n    pre_hook=\"{{ remove_missing_zoho_deals() }}\",\n    tags=['zoho_deals']\n) }}\n\nSELECT\n    NULLIF(TRIM(\"id\"), '') AS deal_id,\n    NULLIF(TRIM(\"Deal_Name\"), '') AS deal_name,\n    NULLIF(TRIM(\"Stage\"), '') AS stage,\n    NULLIF(TRIM(\"Sub_Pipeline\"), '') AS sub_pipeline,\n"
  },
  "monitor": {
    "title": "Entrada do job na fila persistente",
    "language": "Python",
    "explanation": "O executor valida o script, limita a fila e registra o job em SQLite antes de encaminhar a execução.",
    "source": "monitor/server.py",
    "href": "https://github.com/gabrielassisp/etl-python-dbt/blob/main/monitor/server.py#L131-L152",
    "startLine": 131,
    "code": "    def submit(self, file, trigger='manual'):\n        if file not in CATALOG or not (self.directory / file).is_file():\n            raise ValueError('Script não permitido ou indisponível.')\n        with self.lock, self.db() as db:\n            if db.execute(\"SELECT count(*) FROM runs WHERE status IN ('queued','running')\").fetchone()[0] >= 20:\n                raise ValueError('A fila está cheia. Aguarde as execuções atuais.')\n            ident = str(uuid.uuid4())\n            try:\n                db.execute('INSERT INTO runs(id,file,status,created_at,trigger) VALUES (?,?,?,?,?)',\n                           (ident, file, 'queued', now(), trigger))\n            except sqlite3.IntegrityError:\n                raise ValueError('Este script já está na fila ou em execução.')\n        self.jobs.put(ident)\n        return ident\n\n    def listing(self):\n        with self.db() as db:\n            rows = [dict(r) for r in db.execute('SELECT id,file,status,created_at,started_at,finished_at,returncode,trigger,note FROM runs ORDER BY created_at DESC LIMIT 200')]\n            counts = dict(db.execute('SELECT status,count(*) FROM runs GROUP BY status').fetchall())\n        return dict(runs=rows, counts=counts)\n\n    def detail(self, ident):"
  },
  "economia": {
    "title": "Ingestão das três fontes e início da validação",
    "language": "Python",
    "explanation": "Trecho do orquestrador original que coleta IBGE, Banco Central e World Bank e inicia a etapa de qualidade.",
    "source": "brazil-econ-pipeline/pipeline.py",
    "href": "https://github.com/gabrielassisp/Brazil-Pipeline-Project/blob/main/brazil-econ-pipeline/pipeline.py#L42-L64",
    "startLine": 42,
    "code": "    # ── Etapa 1: Ingestão ────────────────────────────────────────\n    logger.info(\"\\n[1/4] INGESTÃO — coletando dados das APIs...\")\n    os.makedirs(\"data\", exist_ok=True)\n\n    from ingestion.ibge_collector import run_ibge_collection\n    from ingestion.bcb_collector import run_bcb_collection\n    from ingestion.worldbank_collector import run_worldbank_collection\n\n    ibge_results = run_ibge_collection()\n    bcb_results = run_bcb_collection()\n    wb_results = run_worldbank_collection()\n\n    summary[\"ingestion\"] = {\n        \"ibge\": ibge_results,\n        \"bcb\": bcb_results,\n        \"worldbank\": wb_results,\n    }\n    logger.info(\"Ingestão concluída.\")\n\n    # ── Etapa 2: Validação de qualidade ──────────────────────────\n    logger.info(\"\\n[2/4] QUALIDADE — validando dados na camada Bronze...\")\n    from quality.validator import run_all_validations\n    suites = run_all_validations()"
  },
  "vendas": {
    "title": "Extração da API e início da transformação",
    "language": "Python",
    "explanation": "A função de extração usa timeout e valida a resposta HTTP. Em seguida, a transformação cria o DataFrame de produtos.",
    "source": "app_python/src/etl.py",
    "href": "https://github.com/gabrielassisp/Projeto-App-Python/blob/main/app_python/src/etl.py#L21-L38",
    "startLine": 21,
    "code": "def extrair_produtos() -> list[dict]:\n    \"\"\"Busca todos os produtos da API.\"\"\"\n    logger.info(\"Buscando produtos da Fake Store API...\")\n    response = requests.get(f\"{API_URL}/products\", timeout=10)\n    response.raise_for_status()\n    produtos = response.json()\n    logger.info(f\"{len(produtos)} produtos extraídos.\")\n    return produtos\n\n\ndef transformar_produtos(dados_brutos: list[dict]) -> pd.DataFrame:\n    \"\"\"Limpa e transforma os dados de produtos.\"\"\"\n    df = pd.DataFrame(dados_brutos)\n\n    # Renomear colunas para português\n    df = df.rename(columns={\n        \"id\": \"id\",\n        \"title\": \"nome\","
  },
  "churn": {
    "title": "Cálculo dos indicadores e segmentação",
    "language": "JavaScript",
    "explanation": "Código do dashboard original para calcular taxa de churn, médias e agrupamentos a partir do CSV.",
    "source": "telco_churn_dashboard.html",
    "href": "https://github.com/gabrielassisp/Dashboard-Churn-JS/blob/main/telco_churn_dashboard.html#L495-L513",
    "startLine": 495,
    "code": "function compute(rows) {\n  const total    = rows.length;\n  const churned  = rows.filter(r => r.Churn === 'Yes').length;\n  const retained = total - churned;\n  const churnRate = churned / total * 100;\n  const avgMonthly = rows.reduce((s,r) => s+(parseFloat(r.MonthlyCharges)||0),0) / total;\n  const avgTenure  = rows.reduce((s,r) => s+(parseInt(r.tenure)||0),0) / total;\n\n  function groupChurn(field) {\n    const map = {};\n    rows.forEach(r => {\n      const k = r[field] || 'N/A';\n      if (!map[k]) map[k] = { total:0, churned:0 };\n      map[k].total++;\n      if (r.Churn === 'Yes') map[k].churned++;\n    });\n    return Object.entries(map)\n      .map(([label,v]) => ({ label, total:v.total, churned:v.churned, rate:v.churned/v.total*100 }))\n      .sort((a,b) => b.rate - a.rate);"
  },
  "documentos": {
    "title": "Pré-validação dos documentos no workflow",
    "language": "JavaScript / n8n",
    "explanation": "Trecho real do nó PRE-VALIDAR OBRIGATORIOS, extraído do workflow sanitizado. A ligação leva ao export completo no GitHub.",
    "source": "n8n/workflows/validacao-documental-zoho-drive-gemini.json · nó PRE-VALIDAR OBRIGATORIOS",
    "href": "https://github.com/gabrielassisp/etl-python-dbt/blob/main/n8n/workflows/validacao-documental-zoho-drive-gemini.json",
    "code": "const dados = $input.first().json;\nconst arquivos = Array.isArray(dados.arquivos_drive) ? dados.arquivos_drive : [];\nconst requisitosOriginais = Array.isArray(dados.documentos_obrigatorios) ? dados.documentos_obrigatorios : [];\n\nconst normalizar = valor => String(valor || '')\n  .normalize('NFD')\n  .replace(/[\\u0300-\\u036f]/g, '')\n  .toLowerCase()\n  .replace(/\\.(pdf|docx?|xlsx?|jpg|jpeg|png|webp)$/i, '')\n  .replace(/[_\\-./()\\[\\],]+/g, ' ')\n  .replace(/\\s+/g, ' ')\n  .trim();\n\nconst stopWords = new Set([\n  'de','da','do','das','dos','e','em','no','na','nos','nas','para','por','com','sem','ao','aos','as','os','um','uma','documento','documentos','arquivo','arquivos'\n]);\n\nconst sinonimos = [\n  [/\\bregistro geral\\b/g, ' rg '],\n  [/\\bcarteira de identidade\\b/g, ' rg '],\n  [/\\bdocumento de identidade\\b/g, ' rg '],\n  [/\\bidentidade\\b/g, ' rg '],\n  [/\\bcadastro de pessoa fisica\\b/g, ' cpf '],"
  },
  "sql": {
    "title": "Classificação das reconexões no SQL do estudo",
    "language": "SQL",
    "explanation": "Trecho da consulta apresentada no estudo de caso original. Não contém resultados ou registros de clientes.",
    "source": "projetos/sql_pipeline_reconexoes.html · bloco SQL",
    "href": "https://github.com/gabrielassisp/Portfolio-Gabriel/blob/main/projetos/sql_pipeline_reconexoes.html",
    "code": "-- ═══════════════════════════════════════════════════════════\n-- CTEs: reconexao_tum | reconexao_tdois | reconexao_ttres\n-- Identifica 3 tipos distintos de reconexão via\n    análise\n-- de histórico textual com regex (PostgreSQL ~*)\n-- ═══════════════════════════════════════════════════════════\n\n-- TIPO 1: Reativação direta (Inativo → Ativo + novo\n    serviço no mesmo dia)\nreconexao_tum AS (\nSELECT\ncliente_servico.id_cliente_servico,\nch_novo.data_cadastro::date AS data_habilitacao,\nuv.name AS vendedor,\ncliente.nome_razaosocial,\nservico.descricao AS servico,\ncidade.nome AS cidade\n\nFROM cliente_servico\n\n-- Evento 1: \"Novo serviço de número (X) adicionado\" —\n    ancora pelo numero_plano\nJOIN cliente_historico ch_novo\nON ch_novo.id_cliente = cliente_servico.id_cliente"
  },
  "comercial": {
    "title": "Incorporação do relatório Power BI",
    "language": "HTML",
    "explanation": "Código real de incorporação do dashboard na página. Este trecho mostra a integração web; não é o modelo DAX ou o arquivo PBIX.",
    "source": "projetos/bi_dashboard_comercial.html · iframe Power BI",
    "href": "https://github.com/gabrielassisp/Portfolio-Gabriel/blob/main/projetos/bi_dashboard_comercial.html",
    "code": "<iframe title=\"Dashboard Comercial 360\"\n  src=\"https://app.powerbi.com/view?r=eyJrIjoiNDBlMWIwYTMtYmI1Ni00NDZjLTgxMDUtNWM3NTk3OTllMjk0IiwidCI6IjY1OWNlMmI4LTA3MTQtNDE5OC04YzM4LWRjOWI2MGFhYmI1NyJ9\"\n  allowfullscreen>\n</iframe>"
  }
};
