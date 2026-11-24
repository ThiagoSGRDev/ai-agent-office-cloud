# Rodada 3b – canais sem mensalidade para residente no Brasil (2026-11-24)

Método: Chrome DevTools MCP, só páginas oficiais públicas, sem login, cadastro, compra nem contorno de proteção. Consulta única. Classes: CONFIRMADA / ESTIMADA / NAO_ENCONTRADA (procurado e ausente) / NAO_PESQUISADA / BLOQUEADA. Complementa `rodada3_coleta.md` (seção 1); não altera nenhum arquivo anterior.

| ID | Canal | Fato | Classe | Fonte e trecho literal |
|---|---|---|---|---|
| R3b-01 | eBay | Listar é grátis; insertion fee só acima de 250 listagens/mês (0,35 USD cada); só se paga taxa quando vende; Store é assinatura opcional | CONFIRMADA | export.ebay.com/en/fees-regulations-policies/seller-fees/: "It's free to list on eBay. You'll only pay a fee if your item sells." / "If you list more than 250 items per month, you'll start paying a $0.35 insertion fee per listing." / "Unlock savings ... with an eBay Store subscription" |
| R3b-02 | eBay | Taxa internacional pode existir conforme o país do endereço registrado ("eBay global country") e o do comprador; valor não lido | CONFIRMADA (existência), NAO_PESQUISADA (valor e se o Brasil entra) | mesma página: "If your eBay registered address is in an 'eBay global country', eBay may charge an International fee." |
| R3b-03 | eBay | Brasil aparece como país de registro ou de pagamento | NAO_ENCONTRADA | as páginas oficiais de cadastro, banco, Payoneer e taxas lidas não mencionam Brasil ("depending on the country you registered in") |
| R3b-04 | eBay | Conta pessoal permitida; pede cartão de crédito/débito; pagamento por banco ou Payoneer; conta Payoneer deve ter o mesmo tipo e país da conta eBay | CONFIRMADA | export.ebay.com .../how-to-create-seller-account/ e /payoneer-account/ |
| R3b-05 | eBay | Taxas da Payoneer (recebimento, saque, câmbio) | NAO_PESQUISADA | custo obrigatório possível, sem dado |
| R3b-06 | Walmart Marketplace | Sem mensalidade nem taxa de adesão, só taxa de referência por categoria | CONFIRMADA | marketplace.walmart.com: "sellers pay zero monthly or set up fees—just a competitive referral rate on items sold." |
| R3b-07 | Walmart Marketplace | Exige "Business Tax ID(s) (SSN not accepted) or Business License Number" e fulfillment pelo WFS ou "another B2C US warehouse with returns capability" | CONFIRMADA | marketplace.walmart.com/about-walmart-marketplace/. Exige empresa; devolução nos EUA |
| R3b-08 | Walmart Marketplace | Se vendedor residente no Brasil é aceito e como | NAO_PESQUISADA | a página específica de vendedores internacionais deu "pagenotfound" e a página lida não cita vendedores internacionais; não houve outra tentativa |
| R3b-09 | Amazon | Guia de cadastro lista, para começar, "government-issued ID, credit card, bank account, business license or registration, proof of residential address, and tax information"; permite escolher "None, I am an individual" | CONFIRMADA | sell.amazon.com/sell/registration-guide. É o guia genérico, não a rota do Brasil |
| R3b-10 | Amazon | Individual vale para residente no Brasil vender na Amazon.com | NAO_ENCONTRADA | nenhuma página lida diz que sim ou não; a rota Brasil para EUA indica Professional (R3-02) |
| R3b-11 | Busca web | Consulta de verificação de elegibilidade do eBay para o Brasil via buscador | NAO_ENCONTRADA (sem resultado; bloqueio não comprovado) | html.duckduckgo.com devolveu 0 resultados; não houve nova tentativa |
| R3b-12 | Etsy, Mercado Livre, TikTok Shop, demais | Elegibilidade e custos | NAO_PESQUISADA | fora do escopo desta consulta; Etsy tem regra de produção própria e não foi lida |

## Dados do fornecedor
- CJ: continua BLOQUEADA (verificação humana, R3-11). Zendrop: preço por SKU exige conta (R3-13). Nenhum custo de fornecedor foi inventado.
- C02: a rodada 3 só mediu demanda e preço na Amazon (R3 seção 3); custo do kit com travesseiro continua não confirmado.
