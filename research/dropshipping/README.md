# Pesquisa de validação – dropshipping internacional

Escopo: EUA (USD) e Espanha (EUR). Orçamento inicial: R$ 0. Comparar loja própria (Shopify) e marketplaces.
Data de início: 2026-11-24.

## Arquivos
- `pesquisa.csv` – registros de evidência (delimitador `;`, UTF-8).
- `pareceres/lucas.md` – análise comercial rodada 1 (Lucas).
- `pareceres/lucas_rodada2.md` – análise comercial rodada 2, EUA (Lucas).
- `pareceres/sofia.md` – auditoria independente (Sofia).
- `decisao.md` – consolidação final (Alex).

## Colunas de `pesquisa.csv`
| coluna | significado |
|---|---|
| tipo_registro | CANDIDATO / FONTE_MERCADO / FONTE_CANAL / FONTE_REGULATORIA / FONTE_FORNECEDOR / FORNECEDOR_PRODUTO / SINAL_DEMANDA / BLOQUEIO |
| id | C01–C30 candidatos; F01… fontes |
| mercado | US, ES, EU, GLOBAL |
| produto_ou_topico | produto candidato ou tema da fonte |
| categoria | categoria do produto/tema |
| fornecedor / plataforma | N/D até haver observação real |
| url | página onde a afirmação aparece ou deve ser verificada |
| atribuicao_url | CONFIRMADA (página lida ou busca ligou a afirmação à URL) / NAO_CONFIRMADA / NAO_APLICAVEL_LEITURA_FALHOU |
| data_consulta | AAAA-MM-DD |
| preco_observado / moeda / frete_observado / prazo_entrega_texto / moq | só dados vistos numa fonte; senão N/D |
| status_dado | ver abaixo |
| afirmacao_resumida | o que a fonte afirma, em resumo (não é citação literal) |
| trecho_literal | citação da página; N/D enquanto a página não for lida |
| nota_inferencia | hipótese ou estimativa de Alex, sempre rotulada, nunca conta como fato |

## status_dado
- `CONFIRMADO` – página lida, com trecho literal, URL e data.
- `SNIPPET_NAO_VERIFICADO` – só o resumo de uma busca; página não lida.
- `NAO_ENCONTRADO` – ainda sem dado.
- `HIPOTESE` – candidato escolhido por critério, sem dado de demanda ou fornecedor.

## Regras
1. Campo sem dado = `N/D`. Nada é preenchido por estimativa.
2. Estimativas só em `nota_inferencia`, rotuladas.
3. Dados conflitantes viram linhas separadas; ninguém faz média.
4. Preço é observação datada, não preço fixo. Prazo é o declarado pela fonte.
5. Lucas usa apenas `CONFIRMADO` nos números e lista as lacunas.
6. Sofia audita esquema, rastreabilidade e cálculos; não navega.

## Limitações atuais (2026-11-24)
- Páginas são lidas pelo agente `web-fetch` (leitura de até ~40 mil caracteres, trechos literais curtos). Registros `CONFIRMADO`: F15–F19, F21, F23–F29, F37–F40, F42–F44 (F20 e F22 são NAO_ENCONTRADO). F30–F33 são leituras que falharam. Sites que bloqueiam leitura automatizada (BigBuy HTTP 403, páginas de produto da CJ com redirecionamento de validação) não foram contornados.
- Lucas e Sofia não têm ferramentas web.
- Sem dados de demanda (tendências, volume de busca, vendas) nem de fornecedor (preço, frete, prazo).

## Registros F01–F14
São resumos de busca (`SNIPPET_NAO_VERIFICADO`). Onde há fonte oficial `CONFIRMADO` equivalente (F15–F26), vale a oficial.

Observação: os ids F34–F36 são do BigBuy por resumo de busca (F34 termos gerais, F35 adesão e F36 mensalidade, estas duas de terceiros e divergentes). `nota_inferencia` começa com `INFERENCIA:` quando é inferência de Alex.

## Rodada 2 (EUA)
Ids F37–F45 (canais e fornecedores), S04–S08 (preço de produto por resumo de busca da CJ), D01–D02 (sinais de demanda por resumo de busca) e B01–B04 (bloqueios). Preços S04–S08 são faixas por variante de resumos de busca e não são fato confirmado.
