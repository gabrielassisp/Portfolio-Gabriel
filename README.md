# Gabriel Assis — Analista de Dados & IA

Portfólio em GitHub Pages com tema original preservado e foco em engenharia de dados.

## Seleção de seis projetos

Uma única grade apresenta Plataforma PostgreSQL/dbt, Brazil Economic Pipeline, Airflow, Monitor ETL, Pipeline SQL e ETL de vendas. Cada card reúne imagem, título, resumo e link para os detalhes. Validação documental permanece acessível pelo endereço antigo, fora da seleção principal.

- [Plataforma pública](platform-demo/): Docker Compose, PostgreSQL, nove modelos dbt e testes incrementais/recuperação.
- [Brazil Pipeline](https://github.com/gabrielassisp/Brazil-Pipeline-Project): cron diário configurado para 04h17 de São Paulo (07h17 UTC). [Disparo schedule comprovado em 03/11/2026](https://github.com/gabrielassisp/Brazil-Pipeline-Project/actions/runs/41660095771): 75 registros, quatro modelos e 16 testes dbt aprovados. A execução foi criada às 12h04min45s de São Paulo; não comprova pontualidade nem regularidade diária.
- [Airflow público](airflow-demo/): exemplo sintético de seis tarefas; DagBag e dag.test() são verificados em CI. Não é o código privado nem comprovação operacional das cinco DAGs profissionais até snapshot/build dbt.

A galeria, a home e a visão geral mantêm a mesma seleção. Métricas, datas e limites ficam em evidencias.html. O case profissional está em projetos/impacto-negocio.html.

## Desenvolvimento e publicação

Sirva a raiz por HTTP; não há build do site. Publicação pela raiz da main no GitHub Pages. Os workflows de laboratório validam somente seus exemplos públicos. Não inclua credenciais, dados internos ou artefatos locais.
