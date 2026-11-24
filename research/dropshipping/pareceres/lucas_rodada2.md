# Parecer comercial (Lucas) – Rodada 2, EUA

Data-base: 2026-11-24. Fonte única: `pesquisa.csv` e `README.md`. Espanha em espera; nada foi apagado e `lucas.md` não foi alterado.
Escopo: C07 bandas, C08 packing cubes, C02 tapete de acupressão, C04 rolo removedor de pelos, C05 suporte de notebook (C18, C20, C21, C27 ficam com a Espanha ou repetem estes).

Regras de rótulo:
- **Fato** = só linhas CONFIRMADO com trecho literal (F15–F19, F21, F23–F29, F37–F40, F42–F44). F41 e F45 são snippets.
- Preços S04–S08 são faixas por variante de resumos de busca da CJ: **não verificados**.
- D01–D02 são sinais de terceiros: avaliações, participação de clique e citação editorial **não são vendas**.
- **[PREMISSA]** = valor escolhido por mim. **[ESTIMATIVA]** = resultado calculado com premissas. **[INFERÊNCIA]** = dedução minha.
- Nenhuma margem abaixo é confirmada. Frete de produto não foi encontrado em nenhuma linha.
- Google Trends, eBay vendidos e Amazon estão bloqueados (B01–B03); TikTok (demanda) não foi consultado; busca e páginas de produto da CJ estão bloqueadas (B04). Spocket não consta no CSV; o coordenador informa que é pago e não foi lido, então não é usado.

---

## 1. Os cinco produtos

### 1.0 Método (vale para todos)

Preço mínimo de venda para não ter prejuízo (piso de equilíbrio): **P_min = (C + S + F) / (1 − r)**, arredondado para cima ao centavo.
- C = custo do produto (faixa observada, não verificada). S = frete, **[PREMISSA]** 0, 3 e 6 USD.
- eBay (F15): r = 13,6%; F = 0,30 USD por pedido se P ≤ 10 USD, 0,40 USD se P > 10 USD; anúncio 0 (dentro dos 250 grátis/mês, **[PREMISSA]** 1 anúncio por item). Usei o F coerente com o P obtido.
- Amazon Individual (F17), só onde a categoria é premissa: r = 15% (comissão), F = 0,99 USD por item. **Regra da comissão mínima:** a Amazon cobra o maior entre 15% do preço e 0,30 USD (F17). Abaixo de P = 2,00 USD vale o mínimo, então P_min = C + S + 0,99 + 0,30. Exemplo: C07, C = 0,23 e S = 0 dá P_min = 1,52 (e não 1,44, que seria o resultado sem o mínimo). A partir de P = 2,00 vale a fórmula com r = 15%.
- TikTok (F19): nenhuma das cinco categorias foi lida (6% só consta para Phones & Tablets e Men's Shoes; 5% para joias). F40 indica que uma empresa dos EUA com proprietário final estrangeiro é condição suficiente para começar a vender; a página não diz que seja a única condição nem cita o Brasil. **Não calculei TikTok.**
- Shopify (F26): o Brasil não consta na lista lida de países do Shopify Payments (F39); gateway de terceiros = 2% + taxa do gateway **N/D**, mais 39 USD/mês. **Não calculei Shopify**, porque a taxa total é desconhecida.
- **[PREMISSA]** Em todas as contas: frete não cobrado do cliente (S é custo do vendedor e não entra na base da comissão) e sem imposto de venda.
- As colunas P_min são **[ESTIMATIVA]**.
- Margem = P − C − S − taxas do canal. É margem **antes** dos custos desconhecidos abaixo.

Custos ainda desconhecidos (fora de todas as contas): tarifa de importação dos EUA (F21 confirma que há direitos aplicáveis, alíquota N/D); taxa de pagamento ou de recebimento (Payoneer, Currency Converter); câmbio e tributos no Brasil; devoluções (F42: Zendrop não aceita devolução no armazém; F45, snippet: CJ EUA idem); anúncios; embalagem e taxas de plano do fornecedor.

### 1.1 C07 – Bandas de resistência (S04, D01)

| Item | Dado | Origem |
|---|---|---|
| Custo (C) | 0,23 a 9,95 USD (kit de 5 níveis, por variante); 0,42 a 3,40 (kit de 5 cores); filtro armazém EUA: 2,06 a 17,88; kit com âncora de porta 2,42 | S04, snippet, **não verificado** |
| Peso | N/D (frete sem base de peso) | |
| Preço de venda | **[PREMISSA]** 20 USD, início da faixa de 20 a 50 USD que concentra 36% dos 119 produtos (D01, terceiro, não verificado). Não há varejo sugerido da CJ para este item. | D01 |
| Sinal de demanda | Concorrência densa; 3 primeiros com 31,6% do clique; líder com mais de 135 mil avaliações. Não são vendas. | D01, snippet |

Usei três pontos de custo, extremos observados em S04: 0,23 e 9,95 (kit de 5 níveis) e 17,88 (topo da listagem filtrada para armazém dos EUA, 2,06 a 17,88). São listagens e variantes diferentes; não sei qual corresponde a qual produto.

**Aviso sobre o preço:** P = 20 USD vem da faixa de preço de um rastreador de terceiros sobre a Amazon (D01, não verificado) e foi aplicada ao eBay. Não é preço observado no eBay (B01 bloqueado).

eBay, P = 20 USD. Taxas = 20 × 13,6% + 0,40 = 3,12; sobra 16,88.

| C (USD) | S (USD) | Margem [ESTIMATIVA] | % do preço | P_min eBay [ESTIMATIVA] |
|---|---|---|---|---|
| 0,23 | 0 | 16,65 | 83,3% | 0,62 |
| 0,23 | 3 | 13,65 | 68,3% | 4,09 |
| 0,23 | 6 | 10,65 | 53,3% | 7,56 |
| 9,95 | 0 | 6,93 | 34,7% | 11,98 |
| 9,95 | 3 | 3,93 | 19,7% | 15,46 |
| 9,95 | 6 | 0,93 | 4,7% | 18,93 |
| 17,88 | 0 | −1,00 | −5,0% | 21,16 |
| 17,88 | 3 | −4,00 | −20,0% | 24,63 |
| 17,88 | 6 | −7,00 | −35,0% | 28,11 |

Amazon Individual, **[PREMISSA]** categoria Sports and Outdoors (15%, F17; a categoria do produto não foi verificada). P = 20: taxas = 3,00 + 0,99 = 3,99; sobra 16,01. Comissão mínima de 0,30 aplicada conforme o método.

| C (USD) | S (USD) | Margem [ESTIMATIVA] | P_min Amazon Individual [ESTIMATIVA] |
|---|---|---|---|
| 0,23 | 0 / 3 / 6 | 15,78 / 12,78 / 9,78 | 1,52 / 4,97 / 8,50 |
| 9,95 | 0 / 3 / 6 | 6,06 / 3,06 / 0,06 | 12,88 / 16,40 / 19,93 |
| 17,88 | 0 / 3 / 6 | −1,87 / −4,87 / −7,87 | 22,20 / 25,73 / 29,26 |

Leitura: a faixa de custo é tão larga (0,23 a 17,88) que a margem vai de 83% a negativa. Sem saber qual variante a CJ vende ao preço visto, não dá para concluir.

### 1.2 C08 – Packing cubes (S05, D02)

| Item | Dado | Origem |
|---|---|---|
| Custo (C) | 4,77 USD (kit de 8); 10,01 a 10,45 USD (kit de 6, "frete grátis" no resumo) | S05, snippet, **não verificado** |
| Peso | N/D | |
| Preço de venda | 29,99 USD = início da sugestão de varejo de 29,99 a 44,99 USD para a versão **com compressão** (**sugestão de fornecedor**, blog da CJ, não verificada) | S05 |
| Sinal de demanda | Reportagem cita packing cubes como essencial e um kit compressivo de seis peças. Citação editorial, não é venda. | D02, snippet |

Ressalva: o varejo sugerido é da versão com compressão. O kit de 8 a 4,77 pode não ser compressivo; o par mais coerente é P = 29,99 com C = 10,45. O par 4,77 + 29,99 é **otimista** e pode estar misturando produtos; as linhas dele estão marcadas.

O resumo S05 cita "frete grátis" para o kit de 6 peças. Por ser snippet não verificado e sem dizer quem paga o frete até o cliente final, **não usei** essa informação: S segue como premissa de 0, 3 e 6 USD.

eBay, P = 29,99 USD. Taxas = 29,99 × 13,6% + 0,40 = 4,48; sobra 25,51.

| C (USD) | S (USD) | Margem [ESTIMATIVA] | % do preço | P_min eBay [ESTIMATIVA] |
|---|---|---|---|---|
| 4,77 (otimista) | 0 | 20,74 | 69,2% | 5,87 |
| 4,77 (otimista) | 3 | 17,74 | 59,2% | 9,35 |
| 4,77 (otimista) | 6 | 14,74 | 49,2% | 12,93 |
| 10,45 | 0 | 15,06 | 50,2% | 12,56 |
| 10,45 | 3 | 12,06 | 40,2% | 16,04 |
| 10,45 | 6 | 9,06 | 30,2% | 19,51 |

Leitura: nos pares coerentes (C = 10,45) a margem [ESTIMATIVA] fica entre 9,06 e 15,06 USD; os valores até 20,74 são o limite otimista. Isso depende de o preço sugerido ser praticável no eBay (sem dado de vendas ou concorrência). C05 e C07 (custos baixos) também têm P_min abaixo do preço de referência usado, então a vantagem do C08 não é de margem comprovada.

### 1.3 C04 – Rolo removedor de pelos (S07)

| Item | Dado | Origem |
|---|---|---|
| Custo (C) | Três modelos: 1,47 a 17,64; 1,39 a 5,68; 3,91 a 15,48 USD por variante. Blog da CJ diz custo de 3 a 5 USD. | S07, snippet, **não verificado** |
| Peso | N/D | |
| Preço de venda | 15 USD = início do varejo de 15 a 25 USD sugerido pelo blog da CJ (**sugestão de fornecedor**, não verificada) | S07 |
| Sinal de demanda | Nenhum (sem D para C04). "Concorrência alta" é hipótese de Alex. | |

Pontos de custo: extremos observados, 1,39 e 17,64. eBay, P = 15 USD. Taxas = 15 × 13,6% + 0,40 = 2,44; sobra 12,56.

| C (USD) | S (USD) | Margem [ESTIMATIVA] | % do preço | P_min eBay [ESTIMATIVA] |
|---|---|---|---|---|
| 1,39 | 0 | 11,17 | 74,5% | 1,96 |
| 1,39 | 3 | 8,17 | 54,5% | 5,43 |
| 1,39 | 6 | 5,17 | 34,5% | 8,91 |
| 17,64 | 0 | −5,08 | −33,9% | 20,88 |
| 17,64 | 3 | −8,08 | −53,9% | 24,36 |
| 17,64 | 6 | −11,08 | −73,9% | 27,83 |

Leitura: o resultado depende totalmente de qual variante é a de 1,39 e qual é a de 17,64. Faixa larga demais para concluir.

### 1.4 C05 – Suporte dobrável de notebook (S08)

| Item | Dado | Origem |
|---|---|---|
| Custo (C) | 11,82 USD (variante preta) | S08, snippet, **não verificado** |
| Peso e material | Cerca de 0,96 kg; plástico e metal, não alumínio puro (difere da descrição do candidato) | S08, snippet |
| Preço de venda | **[PREMISSA]** 29,99 USD, sem nenhuma fonte de preço de mercado ou sugestão de fornecedor (só para ilustrar) | |
| Sinal de demanda | Nenhum | |
| Risco | O anúncio de outro modelo menciona "Amazon Banned" (risco de política, não verificado) | S08 |

Frete: com 0,96 kg, 0 e 3 USD são improváveis. **[INFERÊNCIA]** o peso tende a encarecer o frete (a própria nota de S08 diz o mesmo), então acrescentei o cenário **[PREMISSA]** de 10 USD. Nenhum desses valores vem de dado de frete.

eBay, P = 29,99 USD. Taxas = 4,48; sobra 25,51.

| S (USD) | Margem [ESTIMATIVA] | % do preço | P_min eBay [ESTIMATIVA] |
|---|---|---|---|
| 0 | 13,69 | 45,7% | 14,15 |
| 3 | 10,69 | 35,6% | 17,62 |
| 6 | 7,69 | 25,6% | 21,09 |
| 10 | 3,69 | 12,3% | 25,72 |

Leitura: com um único preço de variante e o frete provavelmente alto, a margem é a mais apertada entre os produtos com dado.

### 1.5 C02 – Tapete de acupressão (S06): dados insuficientes, margem não calculada

| Item | Dado | Origem |
|---|---|---|
| Custo (C) | 1,20 a 2,89 USD para "tapete lotus" em página de categoria; mas o blog da CJ estima atacado de 10 a 15 USD para kit com travesseiro | S06, snippet, **não verificado** |
| Preço de venda | Blog da CJ sugere varejo de 39,99 a 59,99 USD para o kit (**sugestão de fornecedor**) | S06 |
| Problema | As duas faixas diferem de cerca de 4 a 12 vezes e podem ser produtos diferentes. Nenhum preço de kit com travesseiro foi confirmado. | S06 |

Não calculo margem nem preço mínimo. Falta o custo do item que seria vendido. Há também restrição de alegação de saúde (nota de Alex).

---

## 2. Canais para vendedor residente no Brasil

| Canal | Custo inicial confirmado | Taxas por venda confirmadas | Exigências verificáveis | Não confirmado |
|---|---|---|---|---|
| Amazon Individual | Nenhuma mensalidade no trecho de F17 (0,99 USD por item vendido). Plano **Professional: 39,99 USD/mês** (F17). | 0,99 USD/item + comissão de 15% (mín. 0,30 USD) nas categorias Home and Kitchen, Sports and Outdoors, Toys and Games, Tools and Home Improvement; 5% a 17% em Clothing and Accessories (F17). | F37: conta de sell.amazon.com vale para EUA, Canadá, México e Brasil; não exige conta bancária nos EUA (Currency Converter); documentos: ID oficial, cartão de crédito, conta bancária, licença ou registro de empresa, comprovante de endereço, dados fiscais. A opção "None, I am an individual" em F37 é o **tipo de negócio**, não o plano Individual (0,99/item); F37 não trata de planos. F38: na rota América Latina para EUA a página indica conta unificada Professional América do Norte e Brasil, sem exigir empresa ou conta bancária nos EUA; **não afirma** que Individual esteja indisponível. | **Em aberto**: se o plano Individual (0,99/item, F17) vale para vendedor do Brasil, ou se a rota exige Professional (39,99/mês, F38). Tipo de identificação fiscal (SSN ou EIN) não aparece. Categoria de cada produto e aprovação da conta não verificadas. |
| eBay | Valor mensal de loja **não aparece** em F15 (dado ausente, não é ausência confirmada de mensalidade). | 13,6% do valor final + 0,30 USD (até 10 USD) ou 0,40 USD por pedido; 250 anúncios grátis/mês, depois 0,35 USD (F15). | Regra de atacadista (F16). | **Aceitação de vendedor do Brasil, documentos e recebimento (Payoneer)**: F41 é snippet e a URL oficial deu 404; nada específico sobre o Brasil. |
| TikTok Shop | Adesão não lida (F20 ilegível). | 6% nas categorias lidas (Phones & Tablets, Men's Shoes) e 5% em joias (F19); processamento não confirmado. | F40: "empresa dos EUA com proprietário final estrangeiro (25% ou mais)" é a condição que a página apresenta para começar a vender; é condição suficiente, a página não diz que seja a única. Brasil e vendedor residente fora dos EUA não são citados (página de 2025, sem data de atualização). | Se existe rota para residente no Brasil sem empresa nos EUA (não confirmado). Política de dropshipping (não encontrada). **[INFERÊNCIA]** (nota de F40): abrir empresa nos EUA não é custo zero. |
| Shopify | **39 USD/mês** (29 USD no anual) (F26). Teste grátis não verificado em fonte oficial. | Gateway de terceiros 2% + taxa do gateway **N/D** (F26). | **F39: o Brasil não consta na lista lida do Shopify Payments** (só Canadá, México e EUA na América; ausência na lista, sem data); a página manda usar provedor de terceiros se o país não estiver listado. | Qual provedor de terceiros recebe pagamento no Brasil e a taxa dele. |

**Canal com menor custo inicial confirmado:** Amazon Individual (sem mensalidade no trecho de F17, 0,99 USD só por venda). Essa condição vale apenas se o plano Individual valer para vendedor do Brasil, o que está em aberto (F38 indica Professional para a rota América Latina, sem dizer que Individual esteja indisponível); se for exigido Professional, o custo sobe para 39,99 USD/mês. O eBay pode ter custo inicial zero, mas não há confirmação (valor de loja ausente em F15 e Brasil sem confirmação em F41). **Nenhum canal está confirmado como R$ 0 de ponta a ponta.**

O que ainda não está confirmado (todos os canais): taxa de recebimento/saque ao Brasil; aprovação da conta; aceitação do fornecedor pelas regras de dropshipping (F16 eBay; F18 Amazon); processamento do TikTok.

Lacunas de obrigações no Brasil (**não pesquisadas; não afirmo regra nenhuma**): enquadramento do vendedor (pessoa física ou empresa) e eventual CNPJ; tributação de receita recebida do exterior; câmbio e operações de recebimento; IOF; obrigações acessórias e documentos fiscais de exportação; exigências de remessa. Cada tema precisa de fonte oficial brasileira.

---

## 3. Fornecedores

| Fornecedor | Evidência CONFIRMADA | Evidência não verificada | Lacunas |
|---|---|---|---|
| CJdropshipping | F44: dois armazéns nos EUA (Nova Jersey e Chino, Califórnia), entrega de 3 a 6 dias em pedidos domésticos (trecho literal confere com "two large warehouses"); plataforma grátis, sem assinatura; muitos itens ainda vêm da China e demoram mais. F28: quatro centros nos EUA, 2 a 7 dias declarados (**conflito com F44** no número de armazéns). F27: MOQ de 10 por variante e 100 no total, mas a linha não diz a qual serviço se refere; tabela de taxas ambígua. | S04–S08 (preços, snippets). F45 (snippet): armazém dos EUA não aceita devoluções; devoluções vão para a China; prazos de disputa divergem. | Páginas de produto e busca bloqueadas (B04, F33). Sem preço verificado, frete e se cada SKU estaria no armazém dos EUA. |
| Zendrop | F29: começar grátis e teste de 7 dias; preço dos planos **N/D (texto ambíguo)**. F42: fornecedores dos EUA entregam em 3 a 5 dias úteis em média (processamento de 1 a 3 dias úteis, até 5 em alta temporada), só para os EUA; **não aceita devoluções no armazém**. F43: embalagem simples sem marca; o recurso de cartão de agradecimento é para assinantes Plus e Pro. | Nenhuma linha de preço de produto para as cinco. | Catálogo exige login e não foi visto; custo e plano exigidos para fornecedores dos EUA não aparecem (F42); limites do plano grátis (F32 deu 404). F43 cita exemplos de fornecedores como "Amazon Products", o que **[INFERÊNCIA]** pode violar políticas de marketplace (não verificado). |

**Terceiro fornecedor para os EUA: não há com evidência no CSV.** BigBuy é Espanha (F30 e F31 bloqueadas; F34 a F36 são snippets e relatos divergentes de terceiros, não confirmados) e não aparece com evidência para os EUA. Spocket não consta no CSV. Não invento um terceiro.

Compatibilidade com regras de canal (limitado): F18 (Amazon) pede embalagem e notas sem referência a terceiros; F43 diz que a embalagem Zendrop é simples e sem marca, mas notas e faturas não foram verificadas. F16 (eBay) exige acordo com atacadista; nenhuma linha mostra se CJ ou Zendrop são aceitos como tal.

---

## 4. Conclusão

### 4.1 Ranking dos cinco produtos

Critérios: completude do dado de custo, folga da margem [ESTIMATIVA] sobre o piso de equilíbrio, sinal de concorrência e peso. Todas as confianças são baixas porque custo, frete, demanda e tarifa não são fatos.

| # | Produto | Confiança | Motivo |
|---|---|---|---|
| 1 | C08 packing cubes | Baixa | C08 e C04 têm varejo sugerido pelo fornecedor (blog da CJ, não verificado: 29,99 a 44,99 USD para C08; 15 a 25 USD para C04; C02 também tem, 39,99 a 59,99 USD, mas sem custo utilizável). C08 se destaca por (a) kit com custo mais coerente com o varejo sugerido, em dois pares de dados (4,77 e 10,45), e (b) D02 como sinal editorial (não é venda). Margem [ESTIMATIVA] de 9,06 a 15,06 USD no par coerente (C = 10,45); 20,74 é limite otimista (par 4,77 + 29,99). A vantagem sobre C05 e C07 é de **qualidade de dado**, não de margem comprovada. Ressalva: o varejo sugerido é da versão compressiva. |
| 2 | C04 rolo de pelos | Baixa | Margem [ESTIMATIVA] de 5,17 a 11,17 USD nas variantes baratas, prejuízo na cara (17,64). Faixa de custo larga demais; sem sinal de demanda. |
| 3 | C07 bandas | Baixa | Margem [ESTIMATIVA] varia de 83% a negativa (−5% com C = 17,88 e S = 0) conforme a variante; P = 20 vem de rastreador da Amazon aplicado ao eBay. D01 indica concorrência densa (líder com mais de 135 mil avaliações; 3 primeiros com 31,6% do clique), o que pode dificultar um vendedor novo (**[INFERÊNCIA]**). |
| 4 | C05 suporte de notebook | Muito baixa | Um único preço (11,82 USD), peso de cerca de 0,96 kg, material diferente do candidato, sem preço de venda de referência; margem [ESTIMATIVA] cai a 3,69 USD com frete de 10 USD. |
| 5 | C02 tapete de acupressão | Insuficiente | Faixas de custo divergentes (1,20 a 2,89 contra 10 a 15 USD); nenhuma margem calculada. |

### 4.2 Fornecedores

Só dois têm evidência confirmada: CJdropshipping (F27, F28, F44) e Zendrop (F29, F42, F43). Não há terceiro com evidência para os EUA. Nenhum tem preço de produto verificado.

### 4.3 Canal de menor custo inicial confirmado

Amazon Individual (0,99 USD por venda, sem mensalidade no trecho de F17), condicionado a estar em aberto se Individual vale para vendedor do Brasil (F38 indica Professional). eBay pode ser equivalente, mas sem confirmação. TikTok Shop: F40 apresenta empresa dos EUA com proprietário final estrangeiro como condição suficiente; não cita o Brasil. Shopify tem 39 USD/mês e o Brasil não consta na lista lida do Shopify Payments (F39).

### 4.4 Principais riscos

| Risco | Fonte |
|---|---|
| Tarifa dos EUA sobre importações (de minimis suspenso), alíquota desconhecida: pode consumir parte da margem | F21 |
| Em aberto se Individual vale para vendedor do Brasil (F38 indica Professional); possível mensalidade de 39,99 USD | F37, F38, F17 |
| Aceitação do vendedor do Brasil no eBay e recebimento sem confirmação | F41 |
| TikTok Shop: empresa dos EUA é a condição apresentada (suficiente, não se sabe se única); Brasil não citado | F40 |
| Devoluções: Zendrop não aceita no armazém (F42); CJ EUA idem segundo snippet (F45) | F42, F45 |
| Prazo: itens da CJ que não estão no armazém dos EUA demoram mais | F44 |
| Obrigações fiscais no Brasil não pesquisadas | Lacuna |
| Preços, concorrência e demanda não verificados; bloqueios B01–B04 | B01–B04 |

### 4.5 Recomendação

**Testar primeiro o C08 (packing cubes), pela qualidade do dado e não por margem comprovada.** Motivo: C08 e C04 têm varejo sugerido pelo fornecedor (CJ, não verificado; C02 também, mas sem custo utilizável), e C08 se destaca por (a) kit com custo mais coerente com o varejo sugerido (29,99 a 44,99 USD) em dois pares de dados e (b) sinal editorial de interesse (D02, que não é dado de vendas). A vantagem é de qualidade de dado, não de margem comprovada. Pelas contas [ESTIMATIVA], no par coerente (C = 10,45) a margem fica entre 9,06 e 15,06 USD com frete [PREMISSA] de 0 a 6 USD e o piso de equilíbrio no eBay fica entre 12,56 e 19,51 USD; o limite otimista (C = 4,77) chega a 20,74 USD. C05 e C07 também têm piso abaixo do preço de referência adotado, mas esse preço é premissa minha (C05) ou vem de rastreador da Amazon (C07). Isso indica onde testar, não é margem confirmada.

Antes de qualquer investimento, o teste precisa obter: preço e frete reais para os EUA do SKU exato (CJ e/ou Zendrop), se o item sai do armazém dos EUA, alíquota de tarifa, se o canal aceita residente no Brasil e como o pagamento chega.

**A evidência não permite concluir:**
- Que haja demanda: não há dado de vendas (D01 e D02 são sinais de terceiros; Trends, eBay vendidos e Amazon bloqueados; TikTok não consultado).
- Qual é o frete real (nenhuma linha de frete de produto).
- Qual é a margem real (preços de S04–S08 não verificados; tarifa, pagamento, devoluções, impostos no Brasil e câmbio fora das contas).
- Qual canal funciona para um residente no Brasil sem custo (Individual x Professional em aberto em F38, F41 sem confirmação, TikTok com empresa dos EUA como condição apresentada em F40).
- Que o teste caiba em R$ 0: nenhum canal está confirmado como R$ 0 de ponta a ponta.
