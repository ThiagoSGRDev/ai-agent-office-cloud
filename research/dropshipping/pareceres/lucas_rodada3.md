# Parecer comercial (Lucas) – Rodada 3, EUA

Data-base: 2026-11-24. Base principal: `rodada3_coleta.md` (ids R3-xx). Contexto: `README.md`, `pesquisa.csv` (F15, F17, F26, F28, F39, F42, F44, S04–S08), `decisao_rodada2.md`, `pareceres/lucas_rodada2.md`. Nenhum arquivo existente foi alterado. Este é o único arquivo criado.

## 0. Regras de rótulo

- Classes: CONFIRMADA / ESTIMADA / NAO_ENCONTRADA / NAO_PESQUISADA / BLOQUEADA. Toda classe vem com referência. NAO_ENCONTRADA = pesquisado e sem resultado; NAO_PESQUISADA = não consultado na rodada 3.
- **Preço de venda de referência** = mediana de preço da 1ª página da Amazon EUA (R3 seção 3). CONFIRMADA como observação de 2026-11-24, só da 1ª página orgânica, sem patrocinados. A mediana mistura tamanhos de kit, marcas e qualidades. Não é o preço do SKU de fornecedor.
- **Custo do fornecedor (C)** = faixas de S04–S08. ESTIMADA (snippet de busca da CJ, não verificado; R3-14 repete isso para packing cubes). R3-11 e R3-13 mostram que CJ e Zendrop continuam BLOQUEADAS, então nenhum custo foi relido hoje.
- **[PREMISSA]** = valor escolhido por mim, sem dado. **[ESTIMATIVA]** = resultado calculado com premissas.
- Selo "bought in past month" = sinal de compras da própria Amazon, arredondado para baixo (R3 seção 3). Não é venda comprovada de nenhum vendedor, nem faturamento, nem lucro.
- Nada aqui é recomendação de compra, loja, anúncio ou cadastro.
- Não há cotação USD/BRL em nenhuma fonte. Por isso **não converti nada para reais**; os valores ficam em USD (e EUR).

---

## 1. Elegibilidade e custo real por canal (vendedor residente no Brasil, orçamento R$ 0)

| Canal | Custo confirmado | Elegibilidade para residente no Brasil | Depende de CNPJ/registro? | Sem prova |
|---|---|---|---|---|
| Amazon Professional | 39,99 USD/mês + taxa de referência (R3-01, F17, CONFIRMADA). Cartão de crédito é pedido no cadastro (F37, CONFIRMADA). | É a conta que a própria Amazon manda criar na rota América Latina para EUA: "Professional North America and Brazil unified" (R3-02, CONFIRMADA). Não exige entidade nem conta bancária nos EUA (R3-04, CONFIRMADA). | **Sim, na rota oficial.** Pede "Business license or registration", comprovante de endereço do negócio, informação fiscal, conta bancária e verificação de identidade (R3-03, CONFIRMADA). | Se um CNPJ/MEI satisfaz esse "registro" (R3-10 NAO_PESQUISADA: não consultado). Custo de abrir o registro (NAO_ENCONTRADA). Aprovação da conta (não testada). |
| Amazon Individual | 0,99 USD por item vendido, sem mensalidade no trecho (R3-01, F17, CONFIRMADA). | A página da rota Brasil→EUA indica só Professional e não oferece Individual (R3-05, ESTIMADA: inferência por ausência na rota; o confirmado é R3-02, que indica Professional; o cadastro não foi testado). F38 diz que a página não afirma que Individual esteja indisponível. | F37 também lista "business license or registration" entre os documentos, embora ofereça o tipo de negócio "None, I am an individual". Os dois textos não foram conciliados. | **Se Individual vale para vendedor residente no Brasil: sem prova.** |
| eBay | Taxas de venda: 13,6% do valor final + 0,30 USD (pedido até 10 USD) ou 0,40 USD (acima); 250 anúncios grátis/mês, depois 0,35 USD (F15, CONFIRMADA). Valor mensal de loja não aparece em F15 (dado ausente, não é prova de gratuidade). Cartão de crédito/débito é pedido no cadastro (R3-07, CONFIRMADA). | Conta Personal ou Business; repasse por conta bancária ou Payoneer "depending on the country you registered in" (R3-07, CONFIRMADA). **O Brasil aparece como país suportado: NAO_ENCONTRADA (R3-08).** F41 (snippet) também não diz nada do Brasil e a URL oficial deu 404. | Conta Personal existe (R3-07), mas não se sabe se vale no Brasil. | **R3-08** (Brasil suportado), recebimento no Brasil, tributação (R3-10). Vendidos e concluídos BLOQUEADA (R3 seção 4). |
| Shopify | Basic 39 USD/mês ou 29 USD/mês no anual; gateway de terceiros 2%; Shopify Payments 2,9% + 0,30 USD (F26, CONFIRMADA). Teste grátis sem fonte oficial (só snippet F07). | **Brasil fora da lista do Shopify Payments** (R3-09/F39, CONFIRMADA na rodada 1, não relida hoje). Teria de usar gateway de terceiros, cuja taxa é NAO_ENCONTRADA. | Não verificado. | Qual gateway recebe no Brasil e a taxa dele. Sem plano grátis no que foi lido (F26). |
| TikTok Shop (EUA) | Comissão de 6% (Phones & Tablets, Men's Shoes) e 5% (joias) (F19, CONFIRMADA). Nenhuma das 5 categorias foi lida. Adesão: F20 ilegível. | A página lida (F40, CONFIRMADA) só apresenta a rota de empresa dos EUA com proprietário final estrangeiro ("US company with foreign UBO"); outras rotas não foram verificadas (TikTok não foi consultado na rodada 3: NAO_PESQUISADA). O Brasil e o residente fora dos EUA não são citados. | **Na rota lida (F40), sim, empresa nos EUA; outras rotas não verificadas.** Abrir empresa nos EUA não é custo zero (inferência de F40). | Rota sem empresa nos EUA; política de dropshipping. |

**Fornecedores (custo do lado do fornecedor):**
- CJ: plataforma grátis, sem assinatura (F44, CONFIRMADA). Busca e produtos BLOQUEADAS por "Human verification" (R3-11). Frete, estoque nos EUA e prazo por SKU: NAO_ENCONTRADA (R3-15).
- Zendrop: planos Basic 19, Pro 49, Plus 79 USD/mês nos preços anuais, com 7 dias de teste e "Pay only after the 7 day trial" (R3-12, CONFIRMADA). O preço do plano mensal não foi lido. Catálogo e preço por SKU: BLOQUEADA, exige conta (R3-13).

**Conclusão do item 1:**
1. **Nenhum canal está confirmado como R$ 0 de ponta a ponta.**
2. Amazon Professional **não cabe em R$ 0**: tem custo fixo confirmado de 39,99 USD/mês (R3-01), mais cartão de crédito (F37) e registro empresarial (R3-03).
3. Amazon Individual seria o único com custo fixo zero (0,99 USD só por venda), mas não há prova de que valha para residente no Brasil (R3-05; F38 em aberto).
4. eBay é o único cujo custo fixo mensal não aparece. Isso é dado ausente, não prova de gratuidade, e a aceitação do Brasil está NAO_ENCONTRADA (R3-08).
5. Shopify tem custo fixo de 39 USD/mês e o Brasil está fora do Shopify Payments (F26, F39).
6. A página lida (F40) só apresenta a rota de empresa dos EUA com proprietário final estrangeiro; outras rotas não foram verificadas (TikTok não foi consultado na rodada 3: NAO_PESQUISADA).
7. **Depende de CNPJ/registro empresarial:** Amazon Professional, pelo texto oficial (R3-02, R3-03). A equivalência entre CNPJ/MEI e o "registro" exigido, e as obrigações fiscais no Brasil, estão **sem prova** (R3-10). Também **sem prova**: R3-08 (eBay aceita o Brasil).
8. Nenhum dos custos acima inclui estoque de amostra, tarifa de importação, câmbio ou imposto no Brasil.

---

## 2. Margem unitária na Amazon Professional

### 2.1 Fórmulas

- Taxa de referência = max(r × P ; 0,30 USD), com **[PREMISSA]** r = 15% e mínimo 0,30. Origem: F17 (CONFIRMADA) lista 15% com mínimo 0,30 USD para Home and Kitchen, Sports and Outdoors, Toys and Games e Tools and Home Improvement. Roupas e acessórios vão de 5% a 17% (F17). **A categoria real de packing cubes, pets, escritório e acupressão não foi verificada; a tabela por categoria é NAO_PESQUISADA (R3-06).** Portanto 15% para os cinco produtos é premissa.
- Todos os preços usados são ≥ 2,00 USD, então 15% × P ≥ 0,30 e vale o percentual. Abaixo de 2,00 USD valeria o mínimo.
- Professional: sem taxa de 0,99 por item (R3-01). A mensalidade de 39,99 USD é custo fixo e entra só no ponto de equilíbrio.
- **[PREMISSA]** O frete do cliente final é pago pelo vendedor e não entra na base da comissão. Sem imposto de venda.
- Margem por unidade antes de frete e tarifa: **m = P − 0,15·P − C = 0,85·P − C** [ESTIMATIVA].
- Incógnita **X = frete + tarifa de importação por unidade** (frete NAO_ENCONTRADA em R3-15; alíquota de tarifa NAO_ENCONTRADA, e F21 confirma que há direitos aplicáveis). Margem final = m − X.
- **X máximo que a margem suporta = m** (acima disso, prejuízo por unidade). É também o X de zero lucro.
- Preço mínimo para não ter prejuízo (sem contar a mensalidade): **P_min = (C + X) / 0,85**, arredondado para cima ao centavo, quando P_min ≥ 2,00. Se o resultado cair abaixo de 2,00, vale P_min = C + X + 0,30.
- Ponto de equilíbrio da mensalidade: **n = ⌈39,99 / (m − X)⌉** unidades por mês, definido só se m − X > 0 e usando só a mensalidade como custo fixo. Cenários de X rotulados como **[PREMISSA]**: 0, 3 e 6 USD. Esses valores não vêm de dado de frete.

### 2.2 Preço de venda de referência e conta de 0,85 × P

| Produto | Mediana P (USD) (R3 seção 3, CONFIRMADA) | Taxa 15% = 0,15 × P | 0,85 × P | Mín. observado (USD) |
|---|---|---|---|---|
| C08 packing cubes | 18,99 | 2,8485 | 16,1415 | 9,57 |
| C04 removedor de pelos | 13,25 | 1,9875 | 11,2625 | 4,99 |
| C07 bandas de resistência | 18,99 | 2,8485 | 16,1415 | 5,94 |
| C05 suporte de notebook | 15,98 | 2,3970 | 13,5830 | 6,79 |
| C02 tapete de acupressão | 49,99 | 7,4985 | 42,4915 | 19,19 |

### 2.3 Margem antes de frete e tarifa (m = 0,85·P − C), X máximo e P_min com X = 0

Custos C de S04–S08 (ESTIMADA, snippet). Os pontos de custo são extremos observados; não sei qual variante corresponde a qual preço.

| Produto | C (USD) e origem | m = 0,85·P − C | m / P | X máx. (zero lucro) | P_min, X = 0 |
|---|---|---|---|---|---|
| C08 | 4,77 (kit de 8, S05) | 16,1415 − 4,77 = **11,37** | 59,9% | 11,37 | 4,77 / 0,85 = 5,6118 → **5,62** |
| C08 | 10,01 (kit de 6, S05) | 16,1415 − 10,01 = **6,13** | 32,3% | 6,13 | 10,01 / 0,85 = 11,7765 → **11,78** |
| C08 | 10,45 (kit de 6, S05) | 16,1415 − 10,45 = **5,69** | 30,0% | 5,69 | 10,45 / 0,85 = 12,2941 → **12,30** |
| C04 | 1,39 (S07, mínimo) | 11,2625 − 1,39 = **9,87** | 74,5% | 9,87 | 1,39 + 0,30 = **1,69** (abaixo de 2,00, vale o mínimo de 0,30) |
| C04 | 5,68 (S07, topo do modelo mais barato) | 11,2625 − 5,68 = **5,58** | 42,1% | 5,58 | 5,68 / 0,85 = 6,6824 → **6,69** |
| C04 | 17,64 (S07, máximo) | 11,2625 − 17,64 = **−6,38** | −48,1% | nenhum (já negativa) | 17,64 / 0,85 = 20,7529 → **20,76** |
| C07 | 0,23 (S04, mínimo) | 16,1415 − 0,23 = **15,91** | 83,8% | 15,91 | 0,23 + 0,30 = **0,53** |
| C07 | 2,06 (S04, menor do filtro armazém EUA) | 16,1415 − 2,06 = **14,08** | 74,2% | 14,08 | 2,06 / 0,85 = 2,4235 → **2,43** |
| C07 | 9,95 (S04, topo do kit de 5 níveis) | 16,1415 − 9,95 = **6,19** | 32,6% | 6,19 | 9,95 / 0,85 = 11,7059 → **11,71** |
| C07 | 17,88 (S04, topo do filtro armazém EUA) | 16,1415 − 17,88 = **−1,74** | −9,2% | nenhum | 17,88 / 0,85 = 21,0353 → **21,04** |
| C05 | 11,82 (S08, única variante) | 13,583 − 11,82 = **1,76** | 11,0% | 1,76 | 11,82 / 0,85 = 13,9059 → **13,91** |
| C02 | 2,89 (S06, "tapete lotus", categoria) | 42,4915 − 2,89 = **39,60** | 79,2% | 39,60 | 2,89 / 0,85 = 3,4000 → **3,40** |
| C02 | 10 (S06, estimativa de blog da CJ para kit com travesseiro) | 42,4915 − 10 = **32,49** | 65,0% | 32,49 | 10 / 0,85 = 11,7647 → **11,77** |
| C02 | 15 (S06, blog da CJ) | 42,4915 − 15 = **27,49** | 55,0% | 27,49 | 15 / 0,85 = 17,6471 → **17,65** |

Notas:
- C04 a 17,64 e C07 a 17,88 têm margem negativa mesmo com X = 0. Nesses custos, a mediana não paga o produto.
- O custo de 1,20 de S06 (começo da faixa) não foi usado; o "tapete lotus" pode nem ser o kit com travesseiro. S06 mostra duas faixas que divergem em cerca de 3,5 a 12,5 vezes, e nenhum preço de kit com travesseiro foi confirmado.
- C04 em S07 tem ainda uma terceira faixa, de 3,91 a 15,48. Ao custo de 15,48 a margem na mediana é negativa: 0,85 × 13,25 − 15,48 = 11,2625 − 15,48 = **−4,22** (P_min, X = 0: 15,48 / 0,85 = 18,2118 → 18,22, acima da mediana de 13,25).
- S07 também traz "3 a 5 USD" do blog da CJ. É sugestão do fornecedor, não preço observado, e não foi usada.

### 2.4 P_min com frete+tarifa X = 3 e X = 6 [PREMISSA]

P_min = (C + X) / 0,85, arredondado para cima ao centavo.

| Produto, C | X = 3 | X = 6 |
|---|---|---|
| C08, 4,77 | 7,77 / 0,85 = 9,1412 → 9,15 | 10,77 / 0,85 = 12,6706 → 12,68 |
| C08, 10,01 | 13,01 / 0,85 = 15,3059 → 15,31 | 16,01 / 0,85 = 18,8353 → 18,84 |
| C08, 10,45 | 13,45 / 0,85 = 15,8235 → 15,83 | 16,45 / 0,85 = 19,3529 → 19,36 |
| C04, 1,39 | 4,39 / 0,85 = 5,1647 → 5,17 | 7,39 / 0,85 = 8,6941 → 8,70 |
| C04, 5,68 | 8,68 / 0,85 = 10,2118 → 10,22 | 11,68 / 0,85 = 13,7412 → 13,75 |
| C04, 17,64 | 20,64 / 0,85 = 24,2824 → 24,29 | 23,64 / 0,85 = 27,8118 → 27,82 |
| C07, 0,23 | 3,23 / 0,85 = 3,8000 → 3,80 | 6,23 / 0,85 = 7,3294 → 7,33 |
| C07, 2,06 | 5,06 / 0,85 = 5,9529 → 5,96 | 8,06 / 0,85 = 9,4824 → 9,49 |
| C07, 9,95 | 12,95 / 0,85 = 15,2353 → 15,24 | 15,95 / 0,85 = 18,7647 → 18,77 |
| C07, 17,88 | 20,88 / 0,85 = 24,5647 → 24,57 | 23,88 / 0,85 = 28,0941 → 28,10 |
| C05, 11,82 | 14,82 / 0,85 = 17,4353 → 17,44 | 17,82 / 0,85 = 20,9647 → 20,97 |
| C02, 2,89 | 5,89 / 0,85 = 6,9294 → 6,93 | 8,89 / 0,85 = 10,4588 → 10,46 |
| C02, 10 | 13 / 0,85 = 15,2941 → 15,30 | 16 / 0,85 = 18,8235 → 18,83 |
| C02, 15 | 18 / 0,85 = 21,1765 → 21,18 | 21 / 0,85 = 24,7059 → 24,71 |

Comparação do P_min com a mediana (todos [ESTIMATIVA]). "P_min acima da mediana" = prejuízo ao preço mediano. **P_min igual à mediana = margem zero ao preço mediano, não "passa".** Nenhum P_min da tabela é exatamente igual à mediana. Lista completa dos casos em que P_min > mediana:
- Com X = 0: C04 a 17,64 (20,76 > 13,25); C07 a 17,88 (21,04 > 18,99); C04 na terceira faixa de S07, 15,48 (18,22 > 13,25, ver notas de 2.3).
- Com X = 3: C05 a 11,82 (17,44 > 15,98), além dos casos de X = 0 (que também ficam acima da mediana).
- Com X = 6: C04 a 5,68 (13,75 > 13,25); C08 a 10,45 (19,36 > 18,99); C05 a 11,82 (20,97 > 15,98), além dos casos anteriores.
- Ficam abaixo da mediana, mas perto: C08 a 10,01 com X = 6 (18,84 contra 18,99) e C07 a 9,95 com X = 6 (18,77 contra 18,99).

### 2.5 Ponto de equilíbrio da mensalidade de 39,99 USD (unidades/mês)

n = ⌈39,99 / (m − X)⌉. "—" = m − X ≤ 0, ou seja, nunca cobre a mensalidade nesse cenário. Premissa: a mensalidade é o único custo fixo; devolução, câmbio, Currency Converter, impostos no Brasil, anúncios e amostras ficam de fora.

| Produto, C | m | X = 0 | X = 3 | X = 6 |
|---|---|---|---|---|
| C08, 4,77 | 11,3715 | 39,99/11,3715 = 3,52 → **4** | /8,3715 = 4,78 → **5** | /5,3715 = 7,45 → **8** |
| C08, 10,01 | 6,1315 | /6,1315 = 6,52 → **7** | /3,1315 = 12,77 → **13** | /0,1315 = 304,1 → **305** |
| C08, 10,45 | 5,6915 | /5,6915 = 7,03 → **8** | /2,6915 = 14,86 → **15** | — (5,69 − 6 < 0) |
| C04, 1,39 | 9,8725 | /9,8725 = 4,05 → **5** | /6,8725 = 5,82 → **6** | /3,8725 = 10,33 → **11** |
| C04, 5,68 | 5,5825 | /5,5825 = 7,16 → **8** | /2,5825 = 15,49 → **16** | — |
| C04, 17,64 | −6,3775 | — | — | — |
| C07, 0,23 | 15,9115 | /15,9115 = 2,51 → **3** | /12,9115 = 3,10 → **4** | /9,9115 = 4,03 → **5** |
| C07, 2,06 | 14,0815 | /14,0815 = 2,84 → **3** | /11,0815 = 3,61 → **4** | /8,0815 = 4,95 → **5** |
| C07, 9,95 | 6,1915 | /6,1915 = 6,46 → **7** | /3,1915 = 12,53 → **13** | /0,1915 = 208,8 → **209** |
| C07, 17,88 | −1,7385 | — | — | — |
| C05, 11,82 | 1,763 | /1,763 = 22,68 → **23** | — | — |
| C02, 2,89 | 39,6015 | /39,6015 = 1,01 → **2** | /36,6015 = 1,09 → **2** | /33,6015 = 1,19 → **2** |
| C02, 10 | 32,4915 | /32,4915 = 1,23 → **2** | /29,4915 = 1,36 → **2** | /26,4915 = 1,51 → **2** |
| C02, 15 | 27,4915 | /27,4915 = 1,45 → **2** | /24,4915 = 1,63 → **2** | /21,4915 = 1,86 → **2** |

Todos os números desta tabela são ESTIMADA (premissas de preço, taxa, custo e X). Equilíbrio de poucas unidades não indica que as unidades serão vendidas: o selo da Amazon não dá vendas do vendedor (item 3).

### 2.6 Sensibilidade: vender ao menor preço observado [PREMISSA]

Um vendedor novo e sem avaliações pode ter de praticar o preço mais baixo da 1ª página. Mesma conta com P = mínimo observado: m = 0,85·P − C.

| Produto | P mín. | 0,85·P | m para cada C |
|---|---|---|---|
| C08 | 9,57 | 8,1345 | C 4,77: **3,36**; C 10,01: **−1,88**; C 10,45: **−2,32** |
| C04 | 4,99 | 4,2415 | C 1,39: **2,85**; C 5,68: **−1,44**; C 17,64: **−13,40** |
| C07 | 5,94 | 5,0490 | C 0,23: **4,82**; C 2,06: **2,99**; C 9,95: **−4,90**; C 17,88: **−12,83** |
| C05 | 6,79 | 5,7715 | C 11,82: **−6,05** |
| C02 | 19,19 | 16,3115 | C 2,89: **13,42**; C 10: **6,31**; C 15: **1,31** |

Leitura: ao preço mínimo observado, só C02 e os custos mais baixos de C07/C04 e C08 a 4,77 ficam positivos, e o espaço para X cai para 1,31 a 13,42 USD. O preço mínimo da página pode ser de um pacote de outro tamanho. É sensibilidade, não preço praticável.

### 2.7 Custos que continuam fora das contas

Frete (NAO_ENCONTRADA, R3-15), tarifa (NAO_ENCONTRADA por produto; F21 confirma que há direitos), taxa de referência real por categoria (NAO_PESQUISADA, R3-06), câmbio e Currency Converter, tributos no Brasil (NAO_PESQUISADA, R3-10), devoluções (F42: Zendrop não aceita devolução no armazém; F45, snippet: CJ EUA idem), embalagem sem marca e acordo escrito de fornecedor exigido pela Amazon (F18), amostras e anúncios.

**Notas de cautela sobre X e sobre a base da comissão:**
- C08 (S05): o custo de 10,01 a 10,45 pode já incluir frete ("frete grátis" no snippet). Se incluir, somar X = 3 ou X = 6 em cima desse custo pode contar o frete duas vezes, e as margens de C08 com X nesses custos ficam pessimistas.
- A premissa da seção 2.1 de que o frete cobrado do cliente não entra na base da comissão pode estar errada: F17 diz "a percentage of the total price". Se o frete cobrado entrar na base, a comissão sobe e as margens caem.

### 2.8 Individual e eBay (informativo)

Mesmos cinco produtos, mesmos extremos de custo C de S04–S08 (ESTIMADA, snippet) e P = mediana da Amazon da seção 2.2 (18,99; 13,25; 18,99; 15,98; 49,99). Margem antes de frete e tarifa (X = 0), todos [ESTIMATIVA]. Sem mensalidade fixa nesses dois canais no que foi lido, então **não calculo ponto de equilíbrio de mensalidade**.

**(a) Amazon Individual** [PREMISSA rotulada: mesma comissão de 15% da seção 2.1, mais 0,99 USD por item (R3-01, F17)]: **m_ind = 0,85·P − C − 0,99**. INFORMATIVO: não há prova de que Individual valha para residente no Brasil (R3-05, ESTIMADA).

| Produto, C | 0,85·P (2.2) | 0,85·P − C | − 0,99 = m_ind |
|---|---|---|---|
| C08, 4,77 | 16,1415 | 16,1415 − 4,77 = 11,3715 | 11,3715 − 0,99 = **10,38** |
| C08, 10,01 | 16,1415 | 16,1415 − 10,01 = 6,1315 | 6,1315 − 0,99 = **5,14** |
| C08, 10,45 | 16,1415 | 16,1415 − 10,45 = 5,6915 | 5,6915 − 0,99 = **4,70** |
| C04, 1,39 | 11,2625 | 11,2625 − 1,39 = 9,8725 | 9,8725 − 0,99 = **8,88** |
| C04, 5,68 | 11,2625 | 11,2625 − 5,68 = 5,5825 | 5,5825 − 0,99 = **4,59** |
| C04, 17,64 | 11,2625 | 11,2625 − 17,64 = −6,3775 | −6,3775 − 0,99 = **−7,37** |
| C07, 0,23 | 16,1415 | 16,1415 − 0,23 = 15,9115 | 15,9115 − 0,99 = **14,92** |
| C07, 2,06 | 16,1415 | 16,1415 − 2,06 = 14,0815 | 14,0815 − 0,99 = **13,09** |
| C07, 9,95 | 16,1415 | 16,1415 − 9,95 = 6,1915 | 6,1915 − 0,99 = **5,20** |
| C07, 17,88 | 16,1415 | 16,1415 − 17,88 = −1,7385 | −1,7385 − 0,99 = **−2,73** |
| C05, 11,82 | 13,583 | 13,583 − 11,82 = 1,763 | 1,763 − 0,99 = **0,77** |
| C02, 2,89 | 42,4915 | 42,4915 − 2,89 = 39,6015 | 39,6015 − 0,99 = **38,61** |
| C02, 10 | 42,4915 | 42,4915 − 10 = 32,4915 | 32,4915 − 0,99 = **31,50** |
| C02, 15 | 42,4915 | 42,4915 − 15 = 27,4915 | 27,4915 − 0,99 = **26,50** |

**(b) eBay** (F15: 13,6% do valor final até 7.500 USD, mais taxa fixa por pedido): **m_ebay = 0,864·P − 0,30 − C**, com 0,864 = 1 − 0,136. INFORMATIVO: o Brasil como país suportado está NAO_ENCONTRADA (R3-08). Base da taxa (se inclui frete ou impostos) não verificada; uso P como valor final.

| Produto | 0,864·P | 0,864·P − 0,30 | C | m_ebay = (0,864·P − 0,30) − C |
|---|---|---|---|---|
| C08 (P 18,99) | 0,864 × 18,99 = 16,40736 | 16,10736 | 4,77 | 16,10736 − 4,77 = **11,34** |
| C08 | idem | 16,10736 | 10,01 | 16,10736 − 10,01 = **6,10** |
| C08 | idem | 16,10736 | 10,45 | 16,10736 − 10,45 = **5,66** |
| C04 (P 13,25) | 0,864 × 13,25 = 11,448 | 11,148 | 1,39 | 11,148 − 1,39 = **9,76** |
| C04 | idem | 11,148 | 5,68 | 11,148 − 5,68 = **5,47** |
| C04 | idem | 11,148 | 17,64 | 11,148 − 17,64 = **−6,49** |
| C07 (P 18,99) | 16,40736 | 16,10736 | 0,23 | 16,10736 − 0,23 = **15,88** |
| C07 | idem | 16,10736 | 2,06 | 16,10736 − 2,06 = **14,05** |
| C07 | idem | 16,10736 | 9,95 | 16,10736 − 9,95 = **6,16** |
| C07 | idem | 16,10736 | 17,88 | 16,10736 − 17,88 = **−1,77** |
| C05 (P 15,98) | 0,864 × 15,98 = 13,80672 | 13,50672 | 11,82 | 13,50672 − 11,82 = **1,69** |
| C02 (P 49,99) | 0,864 × 49,99 = 43,19136 | 42,89136 | 2,89 | 42,89136 − 2,89 = **40,00** |
| C02 | idem | 42,89136 | 10 | 42,89136 − 10 = **32,89** |
| C02 | idem | 42,89136 | 15 | 42,89136 − 15 = **27,89** |

Nota sobre a taxa fixa: com 0,40 em vez de 0,30, cada margem eBay cai 0,10 (por exemplo C05: 1,69 → 1,59; C02 a 15: 27,89 → 27,79). Segundo F15, 0,40 é a taxa para pedidos acima de 10 USD; as cinco medianas estão acima de 10 USD, então 0,40 seria o valor aplicável se o pedido for só o item.

Leitura: nenhum sinal de custo muda de lado em relação à Amazon Professional (C04 a 17,64 e C07 a 17,88 continuam negativos; C05 continua com margem de cerca de 1,6 a 1,8 USD antes de frete). Individual e eBay não substituem a elegibilidade, que continua sem prova.

---

## 3. Concorrência e demanda

Dados da 1ª página orgânica, sem patrocinados (R3 seção 3, CONFIRMADA como observação). Os dois cálculos abaixo (média e peso do maior selo) são meus e [ESTIMADA]. Soma dos selos = valor de R3. A coluna "Soma / itens com selo" (média) é só curiosidade, sem significado para decisão.

| Produto | Itens com selo | Soma dos selos | Soma / itens com selo (curiosidade, sem significado) | Maior selo / soma |
|---|---|---|---|---|
| C08 | 46 | 58.400 | 1.269,6 | 10.000 / 58.400 = 17,1% |
| C04 | 40 | 155.450 | 3.886,3 | 30.000 / 155.450 = 19,3% |
| C07 | 47 | 187.850 | 187.850 / 47 = 3.996,8 | 20.000 / 187.850 = 10,6% |
| C05 | 16 | 23.800 | 1.487,5 | 6.000 / 23.800 = 25,2% |
| C02 | 25 | 15.300 | 612,0 | 4.000 / 15.300 = 26,1% |

O maior selo é um piso arredondado ("10K+" etc.), então o peso do maior selo é aproximado. C05 teve só 16 itens lidos contra ~48 dos demais, e portanto **não é comparável por soma**. A soma usa o piso do selo e pode contar a mesma compra em variações e kits do mesmo produto.

**O que os selos permitem concluir:**
- Há atividade de compra visível na Amazon EUA para os cinco produtos no dia da leitura. C08 (46 itens com selo, maior 10K+), C04 (40, 30K+) e C07 (47, 20K+) mostram o volume mais alto de selos. C02 mostra o menor (soma 15.300).
- Ordem de grandeza de sinal por produto, na 1ª página: C07 > C04 > C08 > C05 > C02 (C05 com ressalva: só 16 itens lidos, não comparável por soma).
- Em packing cubes, marcas estabelecidas dominam a primeira tela (BAGAIL e Veken com 500+ a 10K+ por mês por listagem, avaliações 4,5–4,8). Isso é observação de R3, só de C08.
- A faixa de preço é muito aberta (C08 de 9,57 a 99,00; C02 de 19,19 a 258,40). Há risco de pressão de preço: se o vendedor novo tiver de ficar perto do mínimo, a seção 2.6 mostra a margem caindo.

**O que os selos NÃO permitem concluir:**
- Vendas do vendedor, faturamento ou lucro. O selo é da Amazon, é arredondado para baixo e é de compra do anúncio, não do meu futuro anúncio.
- Que um vendedor novo consiga visibilidade ou a "Buy Box". Os selos concentram-se em marcas com avaliações (inferência minha; reclamações e avaliações negativas são NAO_ENCONTRADA).
- Demanda total mensal. Só a 1ª página foi lida e os patrocinados foram excluídos; a soma pode repetir o mesmo comprador em listagens diferentes.
- Concorrência por marca para C04, C07, C05 e C02: NAO_ENCONTRADA (R3 seção 3 só descreve marcas em C08).
- Tendência ao longo do tempo: Google Trends BLOQUEADA, erro 429 (R3 seção 4).
- Comparar demanda Amazon com eBay: eBay vendidos e concluídos BLOQUEADA (R3 seção 4); TikTok NAO_PESQUISADA. **Sem Trends e sem eBay não há como comparar a demanda entre canais.**
- Margem de nenhum produto: os selos não carregam custo.

**EUA x Espanha, só packing cubes (R3 seção 3, CONFIRMADA como observação):**

| Item | Amazon EUA | Amazon Espanha |
|---|---|---|
| Preço mín. / mediana / máx. | 9,57 / 18,99 / 99,00 USD | 7,12 / 16,52 / 54,98 EUR |
| Itens com selo | 46 de ~48 | 1 de 48 ("50+ bought in past month") |
| Soma dos selos | 58.400 | só 50+ (um item) |

- Não há cotação USD/EUR em nenhuma fonte, logo **não comparo os preços numericamente entre moedas**. Só vale dizer que a faixa de preço na Espanha parece menor em unidade nominal (7,12 a 54,98 contra 9,57 a 99,00), o que não prova nada.
- R3 avisa que o selo pode aparecer menos nesse mercado, então 1 selo contra 46 **não prova menor demanda na Espanha**.
- Para a Espanha há também o direito fixo de 3 EUR por item (F23, CONFIRMADA; pendência de IOSS) e a exigência de operador responsável na UE (F25, CONFIRMADA). Não há custo de fornecedor nem frete para a Espanha.

---

## 4. Ranking dos produtos e teste mínimo

**Teste mínimo (critérios definidos por mim; limiares são [PREMISSA], não dado):**
- T1 margem: m − X > 0 com **folga de X = 6 USD** e no **custo mais alto plausível** de S04–S08 do produto. O 6 vem da premissa da seção 2.4, não de dado.
- T2 demanda visível: selos da Amazon em volume visível. Sinal de compra, não vendas.
- T3 canal viável para residente no Brasil com R$ 0: seção 1. "Não comprovado" = canal NAO_ENCONTRADA ou NAO_PESQUISADA, não reprovado.

| # | Produto | T1 (m no pior custo; X máx.) | T2 | T3 | Confiança | Justificativa |
|---|---|---|---|---|---|---|
| 1 | C02 tapete de acupressão | Passa: m = 27,49 com C = 15, X máx. 27,49 | Sim, fraco (soma 15.300; maior 4K+) | Não comprovado | Muito baixa | Única margem com folga grande mesmo no custo mais alto. O custo do kit com travesseiro NÃO está confirmado (S06 divergente). O preço mediano (49,99) mistura produtos (19,19 a 258,40; só 144 resultados). Demanda é a menor das cinco. A nota de Alex lembra o risco de alegação de saúde. |
| 2 | C08 packing cubes | Passa com X = 3, falha com X = 6 no custo mais alto: m = 5,69 com C = 10,45 (6,13 com C = 10,01) | Sim (46 itens com selo; soma 58.400) | Não comprovado | Baixa | Demanda visível e custo com dois pontos coerentes. Marcas dominam (BAGAIL, Veken). A 9,57 (preço mínimo) o custo mais alto dá −2,32. |
| 3 | C07 bandas de resistência | Falha no pior custo: m = −1,74 com C = 17,88; passa com C ≤ 9,95 (m = 6,19, X máx. 6,19) | Sim, o maior volume (soma 187.850) | Não comprovado | Baixa | Maior sinal de selos, mas mais de 20.000 resultados e custo muito disperso (0,23 a 17,88). Concorrência por marca NAO_ENCONTRADA; D01 (terceiro, snippet) diz concorrência densa. |
| 4 | C04 removedor de pelos | Falha no pior custo: m = −6,38 com C = 17,64; passa com C = 1,39 (9,87) | Sim (soma 155.450) | Não comprovado | Baixa | Margem boa se o custo for o baixo, prejuízo se for o alto. Faixa de custo larga. |
| 5 | C05 suporte de notebook | Falha: m = 1,76 (X máx. 1,76); cobre só X < 1,76 | Sim, mas pequeno (16 itens, 23.800) | Não comprovado | Baixa (um custo só, mas margem baixa) | Peso de ~0,96 kg (S08), material diferente do candidato, e "Amazon Banned" em outro modelo (S08, não verificado). Qualquer frete realista a derruba. |

Critério declarado do ranking: **folga de margem no custo mais alto** (m = 0,85·P − C, X = 0): C02 +27,49; C08 +5,69; C05 +1,76; C07 −1,74; C04 −6,38. Por esse critério a ordem seria C02, C08, C05, C07, C04. **A ordem 3 a 5 da tabela (C07, C04, C05) NÃO segue só esse critério:** ali a demanda visível desempata (soma de selos C07 187.850 > C04 155.450 > C05 23.800, com a ressalva de que C05 teve só 16 itens lidos), e C05 cai para 5º apesar da folga positiva de 1,76, por ser frágil a qualquer frete. Quem preferir só o critério de margem deve ler C05 em 3º.

C02 em 1º vem do preço mediano de lista mista (19,19 a 258,40) e de custo não confirmado (S06 divergente), sem evidência nova de custo desde a rodada 2 (quando era o 5º). **Ranking frágil, confiança muito baixa.** Se o custo do kit com travesseiro for a faixa baixa, a margem é ainda maior; se o produto real for outro, a conta não vale.

**Nenhum produto passa no teste mínimo completo**, porque T3 está não comprovado para todos: nenhum canal está provado viável para residente no Brasil em R$ 0 (seção 1; canais NAO_ENCONTRADA ou NAO_PESQUISADA, não reprovados). **A conclusão se mantém mesmo ignorando T3:** só C02 passa T1+T2, com custo não confirmado e demanda fraca. C08 passa em T1 apenas com folga de X = 3 e falha em X = 6. C07, C04 e C05 falham T1 no pior custo observado.

---

## 5. Recomendação do Lucas

**TESTAR_MAIS** (verificação sem gasto; não é AVANCAR para compra, loja, anúncio ou cadastro). Também não vejo base para DESCARTAR tudo, porque as lacunas decisivas (frete, tarifa, elegibilidade) são NAO_ENCONTRADA e não reprovações. C05 é o mais próximo de descarte: margem de 1,76 USD antes de qualquer frete, com peso de ~0,96 kg.

**O que ainda precisa ser comprovado:**
1. Qual canal aceita residente no Brasil e a que custo: Amazon Individual vale no Brasil? Professional exige CNPJ? eBay aceita o Brasil (R3-08)? Tributação e registro no Brasil (R3-10).
2. Taxa de referência real por categoria (R3-06), por produto.
3. Custo, frete e estoque nos EUA do SKU exato (R3-15, R3-11, R3-13) e alíquota de tarifa por produto (F21).
4. Que o preço mediano da Amazon seja praticável por vendedor novo, com avaliações e marca (concorrência por marca de C04, C07, C05, C02: NAO_ENCONTRADA).
5. Demanda fora da Amazon: Trends e eBay vendidos (BLOQUEADA), TikTok (NAO_PESQUISADA).
6. Política de devolução vigente de CJ e Zendrop (F42, F45 snippet).

**Próxima verificação mais barata (custo R$ 0, só leitura de página pública oficial, sem login nem cadastro):**
1. Primeiro o canal, porque se nenhum canal for viável a margem de produto perde sentido. Ler as páginas públicas oficiais da Amazon (ajuda do vendedor) e da eBay sobre quem pode se registrar a partir do Brasil, e sobre se Individual vale para residente no Brasil. Isso resolve R3-05, R3-08 e F38 sem cadastro.
2. Em paralelo, pesquisar em fontes oficiais brasileiras (gov.br) o que vale para receita do exterior e se o MEI/CNPJ serve de "registro empresarial" (R3-10).
3. Depois, o dado de produto: com uma conta gratuita de CJ ou Zendrop que o usuário já tenha, ou possa abrir por decisão dele, anotar custo, frete e estoque dos EUA de C02, C08 e C07 (as páginas são BLOQUEADAS para leitura automática). Eu não recomendo essa abertura; só indico que é o dado que falta.
4. Ler a tabela de taxas de referência por categoria da Amazon (R3-06), já que a premissa de 15% afeta todas as margens. Se a taxa real for diferente, refazer com m = (1 − r)·P − C.

**Limite do parecer:** o resultado depende de premissas (15% de comissão, X em 0/3/6, preço mediano de lista mista, custos de snippet). Nenhuma margem aqui é lucro confirmado.
