# Parecer comercial (Lucas) – validação de dropshipping internacional (revisado)

Data-base: 2026-11-24. Fonte única: `pesquisa.csv`. Números só de linhas `CONFIRMADO` (F15–F19, F21, F23–F29; F20 e F22 são NAO_ENCONTRADO; F30–F33 são leituras que falharam).
Não li `pareceres/sofia.md`. Rótulos: **[PREMISSA]** (hipótese de cálculo), **[INFERÊNCIA]** (minha dedução, não está na fonte). Valores de CJ (S01–S03) são resumo de busca, **não verificados**, e não entram em nenhuma conta.

Limite geral: nenhum candidato tem preço de fornecedor confirmado nem frete confirmado. **Nenhuma margem de produto é calculável.**

---

## 1. Margem calculável com dados confirmados

Fórmula: margem = preço de venda − custo do fornecedor − frete − taxa do canal − taxa de pagamento − tarifa/direito − devoluções − anúncios.
Só "taxa do canal", "pagamento" (Shopify) e "direito" (UE) têm valor confirmado. Os demais estão ausentes.

| Item | Valor confirmado | Linha | Calculável? |
|---|---|---|---|
| eBay EUA | 13,6% do valor final (até 7.500 USD, por item) + 0,30 USD por pedido (até 10 USD) ou 0,40 USD (acima de 10 USD); anúncio 0,35 USD após 250 grátis/mês | F15 | Sim, taxa do canal. Taxa de pagamento separada não aparece. Valor mensal de loja não aparece na página (dado ausente). |
| Amazon EUA | Professional 39,99 USD/mês; Individual 0,99 USD por item vendido (sem mensalidade no trecho); comissão 15% (mín. 0,30 USD) em Home and Kitchen, Sports and Outdoors, Toys and Games, Tools and Home Improvement; Clothing and Accessories 5% a 17% (trechos conferidos) | F17 | Sim para categorias de 15%. Categoria de cada candidato e restrições de conta não verificadas. |
| TikTok Shop EUA | 6% nos trechos lidos (Phones & Tablets, Men's Shoes); 5% em Jewelry Accessories & Derivatives + Diamond. "Maioria 6%" é resumo, não trecho. Fórmula literal: taxa × (pagamento do cliente + desconto da plataforma − imposto). **Se o frete entra na base: não confirmado** (sem trecho literal). | F19 | Só a comissão, e o 6% vale para as categorias lidas; a categoria de cada candidato não foi verificada. Processamento e adesão: não confirmados (F20 ilegível). |
| Shopify | Basic 39 USD/mês (mensal) ou 29 USD/mês (anual); gateway de terceiros 2%; Shopify Payments 2,9% + 0,30 USD | F26 | Sim. Disponibilidade do Shopify Payments para vendedor sediado no Brasil: não verificada. |
| UE (Espanha) | Direito fixo de 3 EUR por item, remessas até 150 EUR, de 2026-07-01 a 2028-07-01; devedor = declarante (vendedor ou importador); taxa de manuseio da UE indefinida. **IOSS pendente**: não está resolvido se os 3 EUR valem quando o IVA foi recolhido via IOSS | F23, F24 | Sim, 3 EUR por item, com a ressalva do IOSS. |
| EUA, tarifa | De minimis suspenso por prazo indeterminado; remessas até 2.500 USD sujeitas a direitos aplicáveis | F21 | **Não.** A alíquota não consta. |

Ausências que impedem fechar margem:

| Componente ausente | Efeito |
|---|---|
| Preço confirmado do fornecedor por candidato | Impede qualquer margem. |
| Frete do fornecedor até EUA/Espanha | Impede qualquer margem. F27 tem tabela de taxa de saída, mas a própria linha manda não deduzir custo de dropshipping dela (colunas por país não são literais). |
| Alíquota de tarifa dos EUA por produto | Custo incompleto nos EUA. |
| IVA/imposto de venda e câmbio USD/EUR/BRL | Preço líquido e conversão para R$ indefinidos. |
| Taxas de canal para a Espanha (eBay, Amazon, TikTok) | Só há taxas dos EUA confirmadas. |
| Taxa de pagamento de eBay, Amazon e TikTok | Não confirmada. |
| Devolução, reembolso, anúncios | Sem dado confirmado. F12 e F14 são snippets, não são fato. |

---

## 2. Simulações com premissas explícitas

Os exemplos mostram só o que sobra do preço depois das taxas confirmadas. **Não são margem**: falta tirar fornecedor, frete, tarifa dos EUA, IVA e devoluções.

Premissas comuns:
- **[PREMISSA]** Preço de venda hipotético de 25 (USD nos EUA; EUR na Espanha).
- **[PREMISSA]** 1 pedido = 1 item; sem frete cobrado do cliente (assim a dúvida sobre frete na base do TikTok não afeta a conta); sem desconto; sem imposto de venda; 1 anúncio por item (dentro dos 250 grátis da eBay).
- **[PREMISSA]** Categoria na faixa de 15% da Amazon e na de 6% do TikTok.

### 2.1 EUA (P = 25 USD)

| Canal | Conta | Taxa variável | Sobra (antes de fornecedor, frete, tarifa) | Custo fixo mensal confirmado |
|---|---|---|---|---|
| eBay | 25 × 13,6% = 3,40; + 0,40 (pedido > 10 USD); anúncio 0 | 3,80 (15,2%) | 21,20 | Dado ausente (valor de loja não aparece em F15) |
| Amazon Professional | 25 × 15% = 3,75 | 3,75 (15,0%) | 21,25 | 39,99 USD |
| Amazon Individual | 3,75 + 0,99 | 4,74 (19,0%) | 20,26 | Nenhum no trecho de F17 |
| TikTok Shop | 25 × 6% = 1,50 | 1,50 (6,0%), sem processamento | 23,50, menos o processamento (não confirmado) | Adesão não lida (F20) |
| Shopify + Shopify Payments | 25 × 2,9% = 0,725; + 0,30 | 1,03 (4,1%) | ≈ 23,98 | 39 USD (29 no anual) |
| Shopify + gateway de terceiros | 25 × 2% = 0,50 | 0,50 + taxa do gateway (**N/D**) | indefinida | 39 USD (29 no anual) |

Equilíbrio do custo fixo da Shopify, só ilustração. **[PREMISSA]** M = sobra por pedido depois de todos os custos variáveis: pedidos por mês = 39 ÷ M. Para M = 5 USD, 7,8 pedidos (8). M real: desconhecida.

### 2.2 Espanha (P = 25 EUR)

Só uma taxa de canal confirmada pode se aplicar: Shopify (página dos EUA, em USD). Para eBay, Amazon e TikTok na Espanha não há taxa confirmada; **não calculei esses canais.**

Premissas adicionais:
- **[PREMISSA]** Taxas da Shopify da página dos EUA valem para venda em EUR; 0,30 USD tratado como 0,30 EUR só para ilustrar (sem câmbio no arquivo).
- **[PREMISSA]** Item até 150 EUR, importado de fora da UE, vendedor é o declarante e absorve os 3 EUR, e o direito se aplica (IOSS pendente em F23).
- **[PREMISSA]** IVA não modelado (sem alíquota confirmada).

| Linha | Conta | Valor (EUR) |
|---|---|---|
| Preço hipotético | | 25,00 |
| Shopify Payments, parte percentual | 25 × 2,9% | 0,725 |
| Shopify Payments, parte fixa | | 0,30 |
| Direito da UE | 1 item × 3,00 | 3,00 |
| Total de taxas confirmadas | | ≈ 4,03 (16,1%) |
| Sobra antes de fornecedor, frete, IVA, GPSR | | ≈ 20,98 |
| Custo fixo mensal | Shopify Basic | 39 USD (29 no anual) |

Peso do direito de 3 EUR por preço (aritmética):

| Preço de venda (EUR) | 10 | 25 | 50 | 100 |
|---|---|---|---|---|
| 3 EUR como % do preço | 30% | 12% | 6% | 3% |

---

## 3. Dados ausentes

| # | Dado ausente |
|---|---|
| 1 | Preço de atacado confirmado de qualquer produto (CJ S01–S03 só em snippet; F33 bloqueada; BigBuy F30/F31 com HTTP 403; Zendrop F32 com 404). |
| 2 | Frete e prazo reais do fornecedor até EUA e Espanha. Declarado: CJ EUA 2–7 dias (F28). Espanha: sem prazo. |
| 3 | Se o armazém espanhol da CJ atende dropshipping ou só estoque próprio; a Espanha na lista europeia é dito pelo agente de leitura, sem trecho literal (F28). |
| 4 | Alíquota de tarifa dos EUA por produto e quem paga (vendedor ou cliente). |
| 5 | Taxa de manuseio da UE (F23) e resolução do IOSS pendente (F23). |
| 6 | Taxas de eBay, Amazon e TikTok para a Espanha. |
| 7 | Taxa de pagamento de eBay, Amazon e TikTok. Processamento de 2–2,5% do TikTok só em snippet (F10). |
| 8 | Taxa de adesão e política de dropshipping do TikTok Shop (F20 ilegível; F11 snippet diz que envio do exterior é proibido); se o frete entra na base de comissão (F19 sem trecho). |
| 9 | Valor mensal de loja eBay (F15); aprovação de conta; categorias restritas na Amazon (F17). |
| 10 | Se o eBay aceita o fornecedor escolhido (CJ, Zendrop, BigBuy) como "atacadista" (F16). |
| 11 | Preço dos planos Zendrop: N/D (texto ambíguo, F29); limites do plano grátis (F29, F32). |
| 12 | BigBuy: termos só em snippet (F34); adesão de 89 EUR (F35) e mensalidade de 120 EUR (F36) são relatos de terceiros divergentes, não confirmados. |
| 13 | Teste grátis da Shopify em fonte oficial (F26). |
| 14 | Disponibilidade do Shopify Payments e meios de recebimento para vendedor no Brasil. |
| 15 | Custo e fornecedor do responsável GPSR na UE; dados obrigatórios na oferta (F25 não traz). |
| 16 | Demanda (busca, vendas, concorrência) para todos os 30 candidatos. |
| 17 | Taxa de devolução e política de reembolso por canal. |
| 18 | Câmbio USD/EUR/BRL e alíquota de IVA da Espanha. |
| 19 | Custos de anúncio/tráfego. |
| 20 | Normas por produto (contato com alimento, níquel/chumbo/cádmio em joias): só nota de Alex, não verificadas. |

---

## 4. Riscos operacionais

| Área | Risco (fonte) | Efeito |
|---|---|---|
| Tarifa EUA | De minimis suspenso indefinidamente; remessas até 2.500 USD sujeitas a direitos (F21). Alíquota e responsável pelo pagamento ausentes. | Custo oculto por pedido; pode comer a margem. |
| Direito UE | 3 EUR por item, vendedor/importador declara e paga (F23, F24); por item conforme classificação tarifária, não por quantidade. **IOSS pendente** em F23. | Peso alto em item barato. **[INFERÊNCIA]** kits de itens heterogêneos podem gerar cobrança maior que 3 EUR. |
| GPSR | Exige operador econômico responsável na UE (F25). Detalhes na oferta não aparecem na página lida. | Custo e dependência de terceiro para qualquer venda na Espanha. **[INFERÊNCIA]** sem fornecedor que ofereça isso, não fecha em R$ 0. |
| eBay | Dropshipping permitido se tiver o item ou acordo com atacadista; comprar em varejista após a venda não é permitido (F16). Regra pode variar por país. | **[INFERÊNCIA]** risco de violação se o fornecedor for tratado como varejista. |
| Amazon | Vendedor registrado, acordo escrito com fornecedor, embalagem e nota sem referência a terceiros, vendedor responde por devoluções e atendimento (F18). Política completa no Seller Central não lida. | **[INFERÊNCIA]** exige fornecedor com embalagem neutra (marca branca); risco de suspensão se descumprir. |
| TikTok Shop | Política de dropshipping não encontrada (F19). Snippet de fonte comercial diz que envio direto do exterior não é permitido (F11, não verificado). | Sem confirmação oficial; pode inviabilizar o canal. |
| Shopify | Shopify não atua como responsável GPSR (F03, snippet, não verificado). | **[INFERÊNCIA]** o vendedor assume conformidade, atendimento e tributos. |
| Loja própria e GPSR | **[INFERÊNCIA]** exigências próprias: tráfego/anúncios (sem dado) e responsável GPSR. | Custos não estimáveis aqui. |
| Devolução | Sem taxa confirmada por categoria. Amazon: vendedor processa devoluções (F18). Frete de devolução internacional: sem dado. | Pode zerar margem de item barato. |
| Fornecedor | CJ: MOQ de 10 por variante e 100 no total, mas a linha não confirma a qual serviço se refere (F27); **[INFERÊNCIA]** se for o serviço de estoque, implica compra antecipada, incompatível com R$ 0. Tabela de taxas ambígua (F27). Páginas de produto bloqueadas (F33). BigBuy: termos só em snippet (F34). Zendrop: preço e limites do plano grátis ambíguos (F29). | Preço, frete e prazo não verificados. |
| Prazo | CJ EUA 2–7 dias declarados (F28). Espanha sem prazo. | Expectativa do cliente e política de canal podem exigir prazo curto. |

---

## 5. Comparação Shopify x marketplaces (EUA e Espanha)

"N/C" = não confirmado.

| Canal | Mensal fixo | Taxa por venda (EUA) | Espanha | Exigências verificáveis | R$ 0 de ponta a ponta? |
|---|---|---|---|---|---|
| Shopify | 39 USD (29 anual) (F26) | 2,9% + 0,30 USD (Shopify Payments) ou 2% (gateway de terceiros, mais taxa do gateway N/D) | Taxas da página dos EUA; para ES, N/C | GPSR e tributos por conta do vendedor (F03 snippet) | **Não.** Mensalidade confirmada antes da primeira venda; teste grátis sem fonte oficial (F26). |
| eBay | **Dado ausente**: valor de loja não aparece em F15 | 13,6% + 0,30/0,40 USD; anúncio 0,35 após 250 grátis | N/C | Regra de atacadista (F16); GPSR para a UE | **Não confirmado.** Pode não ter mensalidade, mas a página não diz. |
| Amazon Professional | 39,99 USD (F17) | 15% (mín. 0,30 USD) na faixa comum | N/C | Acordo escrito com fornecedor, vendedor registrado (F18) | **Não.** Mensalidade. |
| Amazon Individual | Nenhuma no trecho de F17 | 0,99 USD/item + comissão | N/C | Mesmas de F18; aprovação e categorias não verificadas | **Não confirmado.** |
| TikTok Shop | N/C (adesão não lida, F20) | 6% (5% joias) nas categorias lidas; processamento N/C | N/C | Política de dropshipping não encontrada | **Não confirmado.** Dropshipping do exterior pode ser proibido (F11, não verificado). |

Conclusão da seção: **nenhum canal está confirmado como R$ 0 de ponta a ponta.** Só Shopify e Amazon Professional têm mensalidade confirmada e não cabem em R$ 0. eBay (valor mensal de loja ausente na página) e Amazon Individual (0,99 USD por item, sem mensalidade no trecho) são equivalentes: ambos sem mensalidade confirmada, mas dependem de aprovação de conta, aceitação do fornecedor, recebimento e custos não lidos. TikTok Shop depende de política e adesão não lidas. Para a Espanha nenhum canal fecha: faltam taxas de canal e o custo do GPSR (obrigatório, F25). Isso não é recomendação de produto.

---

## 6. Classificação dos 30 candidatos

Critérios:
- **inviável pela evidência** = dado CONFIRMADO específico do produto impede o candidato.
- **depende de dado ausente** = lacuna específica do produto que pode bloqueá-lo.
- **sem bloqueio conhecido** = nenhum bloqueio específico; **não** significa viável.

Critério uniforme aplicado (mesmo nos dois mercados):
1. Sazonalidade sozinha é hipótese sem dado e **não** move para "depende" (C08, C18, C20).
2. Valor unitário baixo, margem pequena ou volume/peso (frete) movem para "depende" (preço e frete ausentes).
3. Kit de itens de tipos diferentes move para "depende": a cobrança por item segue a classificação tarifária (F24, UE); nos EUA é **[INFERÊNCIA]**. Kit de itens iguais (bandas, packing cubes) não move.
4. Restrição de categoria de marketplace é lacuna geral (F17), vale para os 30 e **não** move ninguém (C02, C27).

Todos os 30 são HIPOTESE, sem preço confirmado e sem demanda; nenhum recebe margem. Lacunas válidas para todos não são repetidas. Os da Espanha (C16–C30) herdam GPSR e o direito de 3 EUR por item (IOSS pendente). Motivos vêm de `nota_inferencia` (hipóteses de Alex), salvo indicação.

**Resultado: inviável 0; depende 21; sem bloqueio 9.**

| ID | Mercado | Produto | Classificação | Motivo |
|---|---|---|---|---|
| C01 | US | Carteira magnética para cartões | depende de dado ausente | Risco de marca e compatibilidade; S01 é MagSafe de couro, não verificado. |
| C02 | US | Tapete de acupressão | sem bloqueio conhecido | Sem eletrônica; evitar alegação de saúde; categoria restrita é lacuna geral (critério 4). |
| C03 | US | Tapete lambível/comedouro de silicone | depende de dado ausente | Norma de contato com alimento não verificada; S02 plástico e S03 silicone (não verificados). |
| C04 | US | Rolo removedor de pelos | sem bloqueio conhecido | Produto manual; concorrência alta (hipótese) não é bloqueio. |
| C05 | US | Suporte dobrável de alumínio | sem bloqueio conhecido | Sem bateria; devolução depende da qualidade (sem dado). |
| C06 | US | Organizador de cabos | depende de dado ausente | Margem unitária baixa (critério 2); falta preço. |
| C07 | US | Kit de bandas elásticas | sem bloqueio conhecido | Mercado saturado (hipótese); kit de itens iguais (critério 3). |
| C08 | US | Organizador de mala | sem bloqueio conhecido | Só sazonalidade (critério 1). |
| C09 | US | Organizador de carro | depende de dado ausente | Compatibilidade de modelo gera devolução (hipótese); sem dado de devolução. |
| C10 | US | Colar de aço inoxidável | depende de dado ausente | Alegação de material, cópia de design, chumbo/cádmio não verificados. |
| C11 | US | Kit de garras e elásticos de seda | depende de dado ausente | Margem unitária pequena (critério 2); kit de itens diferentes (critério 3). |
| C12 | US | Moldes de silicone | depende de dado ausente | Contato com alimento exige conformidade, não verificada. |
| C13 | US | Esponja e escova de limpeza | depende de dado ausente | Barato demais para frete e margem (critério 2). |
| C14 | US | Organizador modular de gaveta | depende de dado ausente | Volumoso: frete (critério 2). |
| C15 | US | Kit de sono (máscara e tampões) | depende de dado ausente | Kit de itens diferentes (critério 3); mercado concorrido (hipótese). |
| C16 | ES | Carteira magnética para cartões | depende de dado ausente | Mesmo risco de marca e compatibilidade de C01; demanda na Espanha não demonstrada. |
| C17 | ES | Comedouro/tapete lambível para pets | depende de dado ausente | Regras UE de contato com alimento não verificadas. |
| C18 | ES | Toalha de praia de secagem rápida | sem bloqueio conhecido | Só sazonalidade e falta de demanda (critério 1); GPSR se aplica. |
| C19 | ES | Garrafa térmica de inox | depende de dado ausente | Conformidade UE de contato com alimento não verificada. |
| C20 | ES | Organizador de mala | sem bloqueio conhecido | Só sazonalidade (critério 1); GPSR se aplica. |
| C21 | ES | Kit de bandas de resistência | sem bloqueio conhecido | Kit de itens iguais (critério 3); GPSR se aplica. |
| C22 | ES | Ferramentas de jardinagem para varanda | depende de dado ausente | Peso médio (frete) e kit de ferramentas diferentes (critérios 2 e 3); demanda por inferência sem fonte. |
| C23 | ES | Cesto organizador dobrável | depende de dado ausente | Volumoso: frete (critério 2). |
| C24 | ES | Pulseira e colar de aço inoxidável | depende de dado ausente | Limite de níquel na UE (conhecimento geral, não verificado nesta sessão). |
| C25 | ES | Kit de garras e elásticos de seda | depende de dado ausente | Margem pequena frente a 3 EUR por item (critério 2); kit heterogêneo (critério 3). |
| C26 | ES | Suporte de celular para carro/bicicleta | depende de dado ausente | Compatibilidade gera devolução (hipótese). |
| C27 | ES | Tapete de acupressão | sem bloqueio conhecido | Sem alegação de saúde; categoria restrita é lacuna geral (critério 4); GPSR se aplica. |
| C28 | ES | Prendedor de toalha/acessórios de praia | depende de dado ausente | Baixo valor unitário frente a 3 EUR por item (critério 2); sazonalidade isolada não conta. |
| C29 | ES | Esponjas e escovas de limpeza | depende de dado ausente | Barato; frete e 3 EUR por item podem eliminar a margem (critério 2). |
| C30 | ES | Kit de sono (máscara e tampões) | depende de dado ausente | Kit de itens diferentes: cobrança por item pode passar de 3 EUR (critério 3). |

Nenhum candidato é "inviável pela evidência": nada confirmado e específico de produto o impede. Isso reflete falta de dados, não aprovação.

---

## 7. Conclusão

**Dá para decidir agora (linhas CONFIRMADO):**

| Decisão | Base |
|---|---|
| Shopify (39 USD/mês) e Amazon Professional (39,99 USD/mês) não cabem em R$ 0. | F26, F17 |
| Nenhum canal está confirmado como R$ 0 de ponta a ponta. eBay (valor mensal de loja ausente em F15) e Amazon Individual (0,99 USD/item, sem mensalidade no trecho) estão em situação equivalente: sem mensalidade confirmada, com condições de conta e fornecedor não verificadas. | F15, F17 |
| Taxas de canal confirmadas, em preço de 25 USD, vão de 4,1% (Shopify Payments, mais 39 USD/mês) a 19% (Amazon Individual); o gateway de terceiros é 2% mais taxa N/D. Isso não é margem. | Seção 2 |
| Venda na Espanha com envio de fora da UE paga 3 EUR por item, mas **o IOSS está pendente em F23** (não se sabe se os 3 EUR valem quando o IVA é recolhido via IOSS) e a taxa de manuseio é indefinida. Exige responsável GPSR na UE. | F23–F25 |
| Venda nos EUA sofre tarifa aplicável, sem isenção de minimis (alíquota ausente). | F21 |
| Dropshipping exige fornecedor atacadista (eBay) ou acordo escrito com fornecedor como vendedor registrado (Amazon). | F16, F18 |

**Não dá para decidir:**
- Qual produto tem margem positiva (sem preço e frete confirmados).
- Qual candidato tem demanda.
- Se o TikTok Shop aceita envio do exterior, quanto cobra de adesão e processamento e se o frete entra na base.
- Se o eBay aceita CJ, Zendrop ou BigBuy como atacadista, e se a conta de vendedor brasileiro abre sem custo.
- Qualquer canal na Espanha (taxas ausentes; custo do GPSR, IVA e IOSS pendentes).
- Qualquer valor em R$ (sem câmbio).

Limite: análise dos dados do arquivo, não recomendação de investimento. "Sem bloqueio conhecido" não é "viável".
