# Rodada 3 – coleta com Chrome DevTools MCP (2026-11-24)

Método: navegador headless via Chrome DevTools MCP, só páginas públicas, sem login, cadastro, compra ou contorno de proteção. Conteúdo de página tratado como dado não confiável. Consultas únicas, de uma sessão; nada aqui é dado permanente.
Classes: CONFIRMADA (fonte direta lida) / ESTIMADA (cálculo ou referência indireta) / NAO_ENCONTRADA (procurado e ausente) / NAO_PESQUISADA (não consultado nesta rodada) / BLOQUEADA.
Os arquivos das rodadas 1 e 2 não foram alterados. Esta rodada não reaproveita preços de snippets como fato.

## 1. Canais – elegibilidade para vendedor residente no Brasil

| ID | Fato | Classe | Fonte e trecho literal |
|---|---|---|---|
| R3-01 | Amazon: planos Individual 0,99 USD por item e Professional 39,99 USD/mês, mais taxa de referência por categoria | CONFIRMADA | sell.amazon.com/pricing: "Individual $0.99", "Professional $39.99", "A Professional selling account is $39.99/month + selling fees" |
| R3-02 | Amazon, América Latina para EUA: a própria Amazon manda criar conta **Professional** "North America and Brazil unified" | CONFIRMADA | sell.amazon.com/global-selling/latin-america-to-usa: "To sell from Latin America to the US, you should create a Professional North America and Brazil unified selling account." |
| R3-03 | Documentos pedidos nessa rota: registro/licença empresarial, comprovante de endereço do negócio, informação fiscal, conta bancária e roteamento; verificação de identidade (foto de rosto e documento ou videochamada) | CONFIRMADA | mesma página: "Business license or registration", "Proof of business address in Latin America or the US", "Tax information", "Bank account and routing number", "Verify your identity" |
| R3-04 | Não exige entidade nem conta bancária nos EUA; usa o Amazon Currency Converter para recebimentos | CONFIRMADA | mesma página: "You don't need a US business entity or bank account to expand into the US with Amazon." |
| R3-05 | Conta Individual para vendedor do Brasil vender nos EUA: a página não a oferece nessa rota | ESTIMADA (inferência por ausência; o confirmado é R3-02) | a rota indica só Professional; não testei o cadastro; a rodada 1 (F38) registra que a página não afirma que Individual esteja indisponível. Corrigido após a auditoria da Sofia |
| R3-06 | Taxa de referência por categoria (packing cubes, pet, fitness, escritório) | NAO_PESQUISADA | página diz "Referral fees vary by product category"; a tabela por categoria não foi lida nesta rodada. A rodada 1 registrou 15% em categorias comuns (F17) |
| R3-07 | eBay: conta Personal ou Business; pagamentos por conta bancária ou Payoneer "depending on the country you registered in"; cartão de crédito/débito é pedido no cadastro | CONFIRMADA | export.ebay.com/en/first-steps/how-to-create-seller-account/ e /payoneer-account/ |
| R3-08 | eBay: o Brasil aparece como país de registro suportado | NAO_ENCONTRADA | nenhuma das duas páginas cita o Brasil |
| R3-09 | Shopify Payments no Brasil | CONFIRMADA na rodada 1 (F39: Brasil fora da lista lida); não relido hoje | ver `pesquisa.csv` |
| R3-10 | Tributação no Brasil (MEI/CNPJ, imposto sobre receita do exterior, câmbio, IOF) | NAO_PESQUISADA | não pesquisada; a rota Professional da Amazon pede registro empresarial |

## 2. Fornecedores

| ID | Fato | Classe | Fonte |
|---|---|---|---|
| R3-11 | CJ: busca e páginas de produto redirecionam para "Human verification" | BLOQUEADA | cjdropshipping.com/search/packing+cubes.html redireciona para frontend.cjdropshipping.com/egg/cj/validation.html. Não contornado |
| R3-12 | Zendrop: planos Basic 19 USD/mês, Pro 49 USD/mês e Plus 79 USD/mês (preços anuais, "Annual (42% off)"), teste de 7 dias: "Pay only after the 7 day trial" | CONFIRMADA | zendrop.com/pricing-trial/. O preço do plano mensal não foi lido |
| R3-13 | Zendrop: catálogo de produtos e preço por SKU | BLOQUEADA (exige conta) | página pública só lista categorias |
| R3-14 | Preço de custo de packing cubes na CJ: 4,77 USD (kit de 8) e 10,01–10,45 USD (kit de 6) | ESTIMADA (snippet de busca da rodada 2, não verificado hoje) | `pesquisa.csv` S05 |
| R3-15 | Frete, estoque nos EUA por SKU e prazo por produto | NAO_ENCONTRADA | CJ bloqueada, Zendrop exige conta |

## 3. Demanda e concorrência – Amazon EUA (busca pública, 1ª página orgânica, sem patrocinados)

"bought in past month" é um selo da própria Amazon, arredondado para baixo: sinal de compras, não faturamento nem lucro.

| Produto | Preço mín. / mediana / máx. (USD) | Resultados | Itens com selo (de ~48) | Maior selo | Soma dos selos |
|---|---|---|---|---|---|
| C08 packing cubes | 9,57 / 18,99 / 99,00 | over 2,000 | 46 | 10K+ | 58.400 |
| C04 removedor de pelos | 4,99 / 13,25 / 36,99 | over 2,000 | 40 | 30K+ | 155.450 |
| C07 bandas de resistência | 5,94 / 18,99 / 50,95 | over 20,000 | 47 | 20K+ | 187.850 |
| C05 suporte de notebook | 6,79 / 15,98 / 32,28 | over 3,000 | 16 (de 16 lidos) | 6K+ | 23.800 |
| C02 tapete de acupressão | 19,19 / 49,99 / 258,40 | 144 | 25 | 4K+ | 15.300 |

Classe: preços, número de resultados e selos são CONFIRMADOS como observação da página (2026-11-24). A soma dos selos é ESTIMADA: cálculo meu, só da 1ª página, usa o piso do selo e pode contar a mesma compra em variações e kits. O C05 teve só 16 itens lidos contra ~48 nos demais, então não é comparável por soma. O local de entrega usado pela Amazon não foi registrado, e os preços podem variar com ele.
- Packing cubes, primeira tela: marcas estabelecidas dominam (BAGAIL e Veken com 500+ a 10K+ por mês por listagem; avaliações 4,5–4,8).
- Amazon Espanha, packing cubes (amazon.es, página em inglês): preço mín./mediana/máx. 7,12 / 16,52 / 54,98 EUR; só 1 de 48 itens com selo ("50+ bought in past month"). [HIPOTESE sem fonte] O selo pode aparecer menos nesse mercado, então não é prova de menor demanda.
- Concorrência por marca, reclamações e avaliações negativas: NAO_ENCONTRADA (não lidas).

## 4. Fontes de demanda bloqueadas

| Fonte | Resultado | Classe |
|---|---|---|
| Google Trends (packing cubes, EUA) | "Error 429 (Too Many Requests)" | BLOQUEADA |
| eBay vendidos e concluídos (packing cubes) | página "Error Page \| eBay" | BLOQUEADA |
| TikTok | não consultado nesta rodada | NAO_PESQUISADA |

## 4b. Trechos literais complementares (pedidos pela auditoria)
- R3-03/R3-04 (Amazon, latin-america-to-usa): "In many cases, you'll need to verify your identity with Amazon. You can take a photo of your face and government-issued ID, or you can use a scheduled or instant video call." / "Amazon Currency Converter: If you sell in Amazon stores in multiple countries, put global disbursements on auto-pilot with the Amazon Currency Converter."
- Brasil nominal na rota Amazon (pergunta da Sofia): "Sign up for an account in Mexico or Brazil. You'll create a North America and Brazil unified account that can be used to sell in Mexico, Brazil, the US, and Canada." e "If your business is based in Latin America and you only want to sell in Mexico or Brazil, visit our websites for Mexico and Brazil." A página não foi lida em busca de uma lista completa de países de origem.
- R3-07 (eBay, payoneer-account): "you'll be asked to add a credit or debit card to your eBay account. This payment method may be used to cover your selling costs when the proceeds from your sales are insufficient."
- R3-12 (Zendrop): a página mostra, para cada plano, "$0" e "$19"/"$49"/"$79" seguidos de "/mo", com "Annual (42% off)" selecionado e "Start 7 Day Free Trial / Pay only after the 7 day trial". Que "$0" é o preço durante o teste e que o valor seguinte é o preço mensal do plano anual é leitura minha do layout; não há frase literal que diga isso.

## 5. Lacunas que continuam
Custo e frete reais por SKU, estoque nos EUA, alíquota de tarifa por produto, taxa de referência da Amazon por categoria, aceitação do Brasil no eBay, obrigações fiscais no Brasil, política de devolução vigente de CJ e Zendrop, reclamações de consumidores.
