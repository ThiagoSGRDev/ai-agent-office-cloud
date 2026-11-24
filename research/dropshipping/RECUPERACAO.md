# Recuperação de `research/dropshipping/`

Data da recuperação: 2026-11-24.

## Origem
Os arquivos desta pasta foram reconstruídos a partir do transcript da sessão `session_01AbqG8NPMoiTXCWEGdcmHfc` ("Sondagem de agentes Lucas e Sofia"). Na sessão original eles nunca foram versionados e se perderam com o contêiner.

## Como foi feito
- Foram lidas 9 páginas de eventos retroativas do transcript (mais 2 chamadas iniciais com os eventos mais recentes, que não alteram arquivos), da sondagem de 02:28 até o fim da rodada 2.
- Foram reproduzidas, em ordem cronológica, 40 operações que tocaram `research/dropshipping/` (Write, Edit e Bash de edição de CSV e README), numa cópia isolada fora do repositório. Os scripts Bash foram triados antes de rodar e só faziam edição de arquivos no diretório da cópia.
- A cópia foi então copiada para esta pasta, sem sobrescrever nada.

## Evidência de fidelidade
- `pareceres/lucas_rodada2.md` reproduzido coincide linha a linha com o `Read` registrado no transcript às 05:37:56 (219 linhas, sendo a última em branco).
- `pesquisa.csv` reproduzido coincide com os `Read` registrados após a última edição do CSV (8 de 8 e 5 de 5 linhas).
- `pesquisa.csv` tem 90 linhas (cabeçalho mais 89 registros) e 19 colunas em todas elas.

## Arquivos
`README.md`, `pesquisa.csv`, `decisao.md` (rodada 1), `decisao_rodada2.md`, `pareceres/lucas.md`, `pareceres/lucas_rodada2.md`, `pareceres/sofia.md`.

## Limitações e lacunas
- `decisao.md`: o texto vem do conteúdo de um Write no transcript, copiado manualmente para a cópia isolada. Não houve leitura posterior no transcript para conferi-lo byte a byte. Seu cabeçalho cita "70 linhas" porque descreve o CSV da rodada 1; o CSV atual tem 89 registros.
- O texto integral das auditorias da Sofia (rodadas 1 e 3, cerca de 16 mil caracteres cada) existe só nas mensagens de devolução do transcript. Em `pareceres/sofia.md` há apenas o resumo e o apêndice da rodada 3.
- O conteúdo bruto das páginas lidas não foi recuperado. O CSV guarda só trechos literais curtos.
- Em 04:04 um script de inserção de linhas falhou numa asserção (F15) e o de 04:05 refez a inserção; a contagem final de linhas fecha com o esperado.
- Os dados da Espanha são da rodada 1 e não foram atualizados na rodada 2.
- A versão final do parecer do Lucas e as últimas correções do CSV não foram reauditadas pela Sofia na sessão original.
- Os arquivos foram preservados como recuperados. Inconsistências de conteúdo não foram corrigidas aqui.

## Aviso de validade
Todos os preços, margens, prazos, taxas e conclusões são de 2026-11-24, de uma única consulta, e várias vêm de resumos de busca (`SNIPPET_NAO_VERIFICADO`) ou são estimativas. Nada disso é dado atual: preços, margens e conclusões antigas precisam ser revalidados antes de qualquer decisão. Os bloqueios da época (Google Trends 429, eBay vendidos 403, Amazon 503, páginas de produto da CJ com validação antirobô, BigBuy 403) foram registrados e não foram contornados.
