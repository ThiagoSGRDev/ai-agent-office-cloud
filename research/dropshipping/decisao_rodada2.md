# Decisão consolidada – rodada 2, EUA (2026-11-24)

Base: `pesquisa.csv` (89 registros), `pareceres/lucas_rodada2.md` e `pareceres/sofia.md`. A Espanha ficou em espera e seus dados foram mantidos.
Regra: fato = linha `CONFIRMADO` com trecho literal. Preço de fornecedor, varejo sugerido, margem e demanda são `[ESTIMATIVA]` ou sinal de terceiros.

## Conclusão em uma linha
Não há evidência para prometer lucro. O que existe é uma ordem de teste provisória (packing cubes primeiro), um canal condicional (Amazon Individual) e uma lista curta do que precisa ser obtido antes de gastar qualquer dinheiro.

## 1. Cinco produtos mais promissores (todos com confiança baixa)
| # | Produto | Margem [ESTIMATIVA] com eBay | Por que nessa posição | Limite |
|---|---|---|---|---|
| 1 | C08 packing cubes | 9,06 a 15,06 USD (par coerente, custo 10,45, venda 29,99), 20,74 só no par otimista | Tem preço de venda sugerido pela CJ e sinal editorial de interesse (D02) | Varejo sugerido é da versão com compressão, custo vem de outra versão |
| 2 | C04 rolo removedor de pelos | 5,17 a 11,17 nas variantes baratas, prejuízo na de 17,64 (venda 15) | Custo baixo em algumas variantes | Faixa de custo muito larga, sem demanda |
| 3 | C07 bandas de resistência | de 83% a negativa conforme a variante (venda 20) | Custo muito baixo | Concorrência densa (D01), prejuízo com a variante de 17,88 |
| 4 | C05 suporte de notebook | 3,69 a 13,69 (venda 29,99) | Preço único de 11,82 | Peso de ~0,96 kg e material diferente do candidato, venda é premissa |
| 5 | C02 tapete de acupressão | não calculada | Candidato de lista de virais | Custos divergentes (1,20–2,89 contra 10–15) |

Ressalvas: C08 e C04 têm varejo sugerido em blog da CJ (C02 também, mas sem custo utilizável). A vantagem do C08 é de qualidade de dado, não de margem comprovada (o parecer do Lucas já foi corrigido nesse ponto). Ranking e margens vêm de resumos de busca da CJ, e as páginas de produto ficaram bloqueadas.

## 2. Fornecedores
| Fornecedor | O que está confirmado | Lacunas |
|---|---|---|
| CJdropshipping | Plataforma grátis sem assinatura (F44), armazéns nos EUA com entrega de 3 a 6 dias (F44) ou 2 a 7 dias (F28), número de armazéns conflitante (dois ou quatro) | Preço e frete de produto, estoque por SKU, devolução (snippet: armazém dos EUA não aceita) |
| Zendrop | Fornecedores dos EUA entregam em 3 a 5 dias úteis, processamento 1 a 3 dias, não aceita devoluções no armazém (F42), embalagem sem marca (F43) | Preço do plano exigido, catálogo (exige login), limites do plano grátis |
| Terceiro | **Não há com evidência.** BigBuy é Espanha e foi bloqueado, Spocket não foi lido | Preciso de URLs ou dados novos |

Só dois fornecedores têm evidência, então não posso listar três.

## 3. Canais para vendedor residente no Brasil
| Canal | Custo inicial confirmado | Exigências confirmadas | Em aberto |
|---|---|---|---|
| Amazon Individual | 0,99 USD por item, sem mensalidade no trecho (F17) | Conta de sell.amazon.com cobre EUA e Brasil, sem conta bancária nos EUA (Currency Converter) (F37) | Se Individual vale para vendedor do Brasil (F38 indica Professional a 39,99 USD/mês), documentos fiscais, aprovação da conta |
| eBay | Valor mensal de loja ausente na página (F15) | Taxas confirmadas (F15), regra de atacadista (F16) | Aceitação de vendedor do Brasil e como receber (F41 é snippet) |
| TikTok Shop | Adesão não lida | Página oficial apresenta empresa dos EUA com proprietário final estrangeiro como condição para vender (F40) | Rota para residente no Brasil sem empresa nos EUA, política de dropshipping |
| Shopify | 39 USD/mês (F26) | Brasil não consta na lista lida do Shopify Payments (F39) | Provedor de pagamento de terceiros no Brasil e sua taxa |

**Canal de menor custo inicial:** Amazon Individual, **condicionado** à pergunta em aberto. Nenhum canal está confirmado como R$ 0 de ponta a ponta. Obrigações fiscais no Brasil (pessoa física ou empresa, tributação da receita do exterior, câmbio, IOF) não foram pesquisadas e ficam como lacuna.

## 4. Principais riscos
1. Tarifa dos EUA sobre importados (de minimis suspenso, F21), alíquota por produto desconhecida.
2. Frete e preço reais de produto não confirmados: a margem pode desaparecer.
3. Sem dado de demanda: Trends (429), eBay vendidos (403), Amazon (503) e TikTok não foram lidos.
4. Individual x Professional em aberto (possível mensalidade de 39,99 USD).
5. Devolução: Zendrop não aceita no armazém, CJ EUA idem segundo snippet.
6. Concorrência densa em bandas de resistência (D01, dado de terceiros).
7. Obrigações fiscais no Brasil e recebimento de pagamentos não pesquisados.

## 5. Recomendação sobre o que testar primeiro
**C08 packing cubes, por qualidade de dado.** Isso indica onde investigar primeiro e não é promessa de lucro. Antes de qualquer teste real é preciso obter: preço e frete para os EUA do SKU exato (CJ ou Zendrop), se o item sai de armazém dos EUA, alíquota de tarifa, se o canal aceita residente no Brasil e como o pagamento chega.

## O que a evidência não permite concluir
Demanda real, frete real, margem real, qual canal serve a um residente no Brasil, e que o teste caiba em R$ 0.

## Estado da auditoria
- Sofia auditou o CSV e o parecer do Lucas (três rodadas). O parecer foi aceito com ressalvas, e as correções foram aplicadas por Lucas e por mim.
- **A versão revisada do parecer do Lucas e as últimas correções do CSV não foram reauditadas.**

## Próximo passo (precisa de você)
Dados de produto da sua conta gratuita de CJ ou Zendrop (preço, frete e estoque dos EUA para o SKU de packing cubes e dos outros quatro), porque as páginas de produto não podem ser lidas automaticamente. Sem isso, a pesquisa não passa de hipótese.
