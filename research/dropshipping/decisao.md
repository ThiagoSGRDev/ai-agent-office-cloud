# Decisão consolidada – validação de dropshipping (2026-11-24)

Base: `pesquisa.csv` (70 linhas), `pareceres/lucas.md` (revisado após auditoria) e `pareceres/sofia.md`.
Regra: só é fato o que está em linha `CONFIRMADO` com trecho literal. O resto é hipótese.

## Decisão
**Ainda não há produto nem canal validado.** Nenhum dos 30 candidatos tem demanda, preço de fornecedor ou frete confirmados, então nenhuma margem de produto é calculável. O que dá para decidir agora é a direção.

| Pergunta | Resposta | Base |
|---|---|---|
| Qual mercado primeiro? | EUA | Taxas de canal confirmadas (F15, F17, F19), sem GPSR nem direito de 3 EUR por item. Espanha: nenhuma taxa de canal confirmada, mais GPSR (F25) e 3 EUR por item (F23, F24). |
| Shopify cabe em R$ 0? | Não | Basic 39 USD/mês (F26). |
| Amazon Professional cabe em R$ 0? | Não | 39,99 USD/mês (F17). |
| Qual canal cabe em R$ 0? | Nenhum confirmado | eBay: valor mensal de loja não aparece (F15, dado ausente). Amazon Individual: 0,99 USD por item, sem mensalidade no trecho (F17). TikTok Shop: comissão 6% só confirmada em algumas categorias (F19), política de dropshipping não encontrada. |
| Fornecedor viável? | Não confirmado | CJ declara 2–7 dias nos EUA (F28), Espanha sem prazo. Preços de produto só por resumo de busca (S01–S03). BigBuy bloqueou a leitura (F30, F31). |

## EUA x Espanha
| Critério | EUA (USD) | Espanha (EUR) |
|---|---|---|
| Taxas de canal confirmadas | eBay, Amazon, TikTok (parcial), Shopify | Só Shopify; direito de 3 EUR por item (F23, F24) |
| Alfândega | Sem de minimis, direitos aplicáveis (F21) | 3 EUR por item até 150 EUR, IOSS pendente (F23) |
| Conformidade | Não pesquisada por produto | GPSR exige responsável na UE (F25), custo não confirmado |
| Fornecedor com estoque local | CJ EUA declarado, 2–7 dias (F28) | CJ lista a Espanha sem prazo (F28), BigBuy não lido |
| Demanda | Sem dado | Sem dado |
| Maturidade da evidência | Média | Baixa |

## Simulações (premissas de Lucas, preço hipotético de 25 USD, sem custo de produto e frete)
Sobra após taxas: eBay 21,20; Amazon Professional 21,25 (mais 39,99 fixos); Amazon Individual 20,26; TikTok 23,50 (só comissão); Shopify Payments ≈ 23,98 (mais 39 fixos). Espanha com Shopify e 3 EUR: ≈ 20,98 (premissa de moeda 1:1 para a taxa fixa). **Isto não é margem**: falta o custo do produto e do frete.

## Candidatos
- 0 inviáveis pela evidência, 21 dependem de dado ausente, 9 sem bloqueio conhecido (C02, C04, C05, C07, C08, C18, C20, C21, C27).
- "Sem bloqueio conhecido" não significa promissor. Significa que nenhum dado atual os exclui. Nenhum tem demanda demonstrada.
- Quatro critérios uniformes estão em `pareceres/lucas.md` (seção 6).

## Divergências entre os pareceres
- Sofia reprovou o CSV inicial como base de decisão e apontou erros meus. Corrigi: 10 itens corrigidos de imediato e os parciais tratados em seguida. Não houve nova auditoria dessas últimas correções.
- Sofia aceitou o parecer do Lucas com ressalvas. Lucas aplicou as 8 correções pedidas. Sofia não reauditou a versão revisada.

## O que bloqueia a validação
1. **Demanda:** nenhum dado confiável (busca, vendas, concorrência). As ferramentas lidas são páginas estáticas, e os dados úteis ficam em ferramentas que exigem login ou script.
2. **Preço e frete de produto:** páginas de produto da CJ redirecionam para validação e o BigBuy devolve 403. Não contornei nenhuma proteção.
3. **Canais:** valor mensal de loja do eBay, política de dropshipping do TikTok Shop, taxas de marketplace na Espanha e custo do responsável GPSR.
4. **UE:** IOSS x direito de 3 EUR (a própria página da Comissão tem duas frases conflitantes) e taxa de manuseio ainda indefinida.
5. **Orçamento zero:** sem dado sobre recebimento em R$, câmbio, tributação do vendedor e devoluções.

## Próximos passos (precisam de decisão do usuário)
- Fornecer dados de demanda e de fornecedor por exportação manual (por exemplo, listas de produtos e preços de CJ ou Zendrop da sua conta gratuita), já que as páginas não podem ser lidas automaticamente.
- Ou autorizar outra via de leitura para dados de demanda.
- Se seguir pelos EUA, a hipótese de menor atrito é eBay ou Amazon Individual com fornecedor de estoque nos EUA. Isso é hipótese, não recomendação confirmada.
