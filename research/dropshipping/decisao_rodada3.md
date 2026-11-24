# Decisão consolidada – rodada 3 (2026-11-24)

Base: `rodada3_coleta.md` (Alex, navegador), `pareceres/lucas_rodada3.md` (Lucas) e a auditoria da Sofia (PASS COM RESSALVAS). Dados de uma única consulta; USD e EUR não foram convertidos para R$ (sem cotação em fonte).
Regra: fato = CONFIRMADA com trecho literal. Preço de fornecedor vem de snippet (ESTIMADA); frete, tarifa, impostos e devoluções ficaram fora das margens.

## Recomendação: TESTAR MAIS
Não é AVANÇAR: nenhum canal está comprovado a R$ 0, nenhum custo de produto foi confirmado e não há demanda do próprio vendedor. Não é DESCARTAR: há demanda visível na Amazon e margem positiva em parte das variantes, com lacunas baratas de fechar.

## 1. Melhor mercado para começar: EUA (confiança média-baixa)
- Há rota oficial documentada de vendedor da América Latina para a Amazon EUA (R3-02), taxas de canal confirmadas (F15, F17) e selos de compra em 46 de 48 listagens de packing cubes.
- Espanha segue como comparação: só 1 de 48 listagens com selo ("50+") e nenhuma taxa de canal confirmada. O selo pode ser menos exibido lá, então isto não prova menor demanda.

## 2. Melhor canal: Amazon, mas não cabe em R$ 0
| Canal | Situação confirmada | Em aberto |
|---|---|---|
| Amazon Professional | 39,99 USD/mês (R3-01). A rota oficial América Latina para EUA pede conta Professional "North America and Brazil unified", com registro empresarial, comprovante de endereço do negócio, dados fiscais e conta bancária (R3-02, R3-03). Não exige entidade nem conta nos EUA (R3-04). O Brasil aparece nominalmente na página | Se CNPJ/MEI serve como registro e quanto custa (R3-10, não pesquisado); taxa de referência da categoria (R3-06) |
| Amazon Individual | 0,99 USD por item, sem mensalidade (R3-01) | Não aparece na rota oficial para o Brasil. Não há prova de que valha para residente no Brasil (R3-05, inferência) |
| eBay | Conta pessoal permitida; pagamento por banco ou Payoneer conforme o país; pede cartão no cadastro (R3-07) | Brasil não citado (R3-08); mensalidade de loja ausente na página (dado ausente, não gratuidade) |
| Shopify | 39 USD/mês (F26); Brasil fora do Shopify Payments (F39, rodada 1) | Gateway de terceiros no Brasil |
| TikTok Shop | Não pesquisado nesta rodada; a página da rodada 1 só apresentou a rota de empresa dos EUA (F40) | Outras rotas não foram verificadas |

**Conclusão do canal:** o único com rota oficial para o Brasil é a Amazon Professional. Nenhum canal está comprovado como R$ 0 de ponta a ponta.

## 3. Produtos (todos com confiança baixa ou muito baixa)
Margem unitária na Amazon Professional, m = 0,85 × preço − custo (premissa de 15% de comissão, vinda de F17 para outras categorias, não verificada para estes produtos). Preço = mediana da 1ª página da Amazon EUA. Custo = faixa de snippet da CJ. Antes de frete, tarifa, câmbio, imposto e devolução. A Sofia refez as contas à mão e confirmou a aritmética.

| Produto | Preço de referência (USD) | Custo (USD) | Margem m (USD) | Equilíbrio da mensalidade 39,99 (unid./mês, sem frete) | Demanda visível (1ª página) |
|---|---|---|---|---|---|
| C08 packing cubes | 18,99 | 4,77 a 10,45 | 5,69 a 11,37 (30 a 60%) | 4 a 8 | 46 itens com selo, até 10K+; marcas dominantes (BAGAIL, Veken) |
| C02 tapete de acupressão | 49,99 | 2,89 a 15 (custo do kit com travesseiro não confirmado) | 27,49 a 39,60 | 2 | 25 itens com selo, até 4K+; só 144 resultados |
| C07 bandas de resistência | 18,99 | 0,23 a 17,88 | −1,74 a 15,91 (prejuízo na variante cara) | 3 a 7 nas baratas; sem equilíbrio na de 17,88 | 47 itens, até 20K+; mais de 20.000 resultados |
| C04 removedor de pelos | 13,25 | 1,39 a 17,64 | −6,38 a 9,87 | 5 a 8; sem equilíbrio na de 17,64 | 40 itens, até 30K+ |
| C05 suporte de notebook | 15,98 | 11,82 | 1,76 (11%) | 23 | só 16 itens lidos (amostra menor) |

- Ranking do Lucas: C02, C08, C07, C04, C05. **A Sofia considera o 1º lugar do C02 frágil**: vem do preço mediano de uma lista mista (19,19 a 258,40) e de um custo não confirmado. Não há evidência nova de custo desde a rodada 2, quando o C02 era o 5º.
- Minha leitura: a ordem não é firme. **Para verificar primeiro: C08 e C02.** C08 por ter demanda visível e margem positiva em quase todo o intervalo, C02 pela folga de margem, ambos com ressalvas (concorrência de marcas no C08, custo e alegação de saúde no C02).
- Nenhum produto passa no teste mínimo (margem com folga para frete e tarifa, demanda visível, canal viável): só o C02 passa margem e demanda, com custo não confirmado; o canal está "não comprovado" para todos (não reprovado). Margens informativas em Individual e eBay (lucas_rodada3.md, 2.8): C08 4,70 a 10,38 (Individual) e 5,66 a 11,34 (eBay); C02 26,50 a 38,61 e 27,89 a 40,00; C05 0,77 e 1,69. Ambos dependem de o Brasil ser aceito (R3-05 estimada, R3-08 não encontrada).

## 4. Custo real para começar
- Confirmado: Amazon Professional 39,99 USD/mês mais comissão por venda; Zendrop Basic 19 USD/mês no plano anual depois de 7 dias de teste (leitura de layout, ver `rodada3_coleta.md` 4b); Shopify 39 USD/mês. A CJ não tem mensalidade (F44), mas está bloqueada para consulta de preços.
- **Não comprovado:** que o início caiba em R$ 0. Faltam o custo de registro empresarial no Brasil (R3-10), taxas de recebimento e câmbio, tarifa de importação nos EUA (de minimis suspenso, F21) e o custo do produto por SKU.

## 5. Principais riscos
1. Mensalidade fixa mais exigência empresarial contra orçamento zero.
2. Margem sensível a frete e tarifa que nenhuma fonte forneceu; várias variantes ficam no prejuízo.
3. Concorrência de marcas com milhares de compras por mês, em especial packing cubes; vendedor novo sem avaliações dificilmente pratica o preço mediano.
4. Custos de fornecedor vêm de resumo de busca, não de página de produto; CJ bloqueia a leitura.
5. Devolução: Zendrop não aceita no armazém (F42) e a CJ EUA, por snippet, idem (F45).
6. Categoria e política da Amazon: alegação de saúde no C02, seller of record e embalagem sem marca.
7. Tributação e recebimento no Brasil sem pesquisa.

## 6. O que ainda precisa ser comprovado (ordem do mais barato)
1. Se um residente no Brasil pode abrir conta Individual ou Professional na Amazon, e com qual registro (páginas oficiais; custo zero).
2. Se o eBay aceita vendedor do Brasil e como paga (páginas oficiais).
3. Obrigações e custo de MEI/CNPJ e de receber do exterior (fontes oficiais brasileiras).
4. Tabela de taxa de referência da Amazon por categoria.
5. Preço, frete, estoque nos EUA e prazo de cada SKU na CJ ou na Zendrop: exige conta gratuita criada por você ou dados copiados por você, pois a CJ bloqueia a leitura.
6. Tarifa de importação por produto, devolução vigente e reclamações de consumidores.

## 7. Ressalvas da auditoria: aplicadas no parecer do Lucas
A Sofia reverificou (PASS COM RESSALVAS) e confirmou a aplicação de: 187.850 ÷ 47 = 3.996,8; "cerca de 3,5 a 12,5 vezes"; comparação completa do preço mínimo com a mediana; T3 como "não comprovado"; critério do ranking explícito (ordem 3 a 5 desempatada pela demanda; C02 em 1º frágil); TikTok sem "exige"; NAO_PESQUISADA; soma dos selos como curiosidade; margens de Individual e eBay (2.8, informativas); notas sobre frete em S05 e base da comissão.
Residuais, sem bloqueio:
- A taxa por pedido do eBay usada na tabela 2.8 é 0,30 USD (premissa otimista): F15 indica 0,40 para pedido acima de 10 USD, que é o caso das cinco medianas. O efeito é 0,10 USD por unidade (a nota de Lucas mostra o ajuste).
- O parecer do Lucas apresenta os planos da Zendrop como CONFIRMADA sem repetir a ressalva de leitura de layout (ver `rodada3_coleta.md`, 4b). A classe "HIPOTESE" usada para a Espanha não consta da lista de classes.
- A lista de referências no início do parecer do Lucas está incompleta (faltam F18–F21, F23, F25, F37, F38, F40, F41 e F45, citados no texto).
- Todas as observações de navegador só foram verificadas por consistência interna e contra `pesquisa.csv`, não contra as páginas.

## 8. Limites desta rodada
Bloqueados e não contornados: CJ (verificação humana), Google Trends (429), eBay vendidos (página de erro). O Brasil na rota Amazon é citado nominalmente, mas não verifiquei uma lista completa de países. Todas as observações de navegador só podem ser repetidas por Alex; a Sofia não as verificou.
