# Parecer da Sofia (auditoria independente)

Registrado por Alex a partir dos relatórios da Sofia. Ela audita sem web e não revalidou nenhuma página.

## Rodada 1 – `pesquisa.csv`
- Veredito: adequado só como registro de evidências e triagem qualitativa de regras. Não adequado como base de decisão de produto ou canal.
- Esquema: 19 campos em todas as linhas, cabeçalho coerente, `status_dado` válido.
- Falhas encontradas: células vazias e prefixo "N/D, " em 15 candidatos, README com lista errada de CONFIRMADO, `atribuicao_url` CONFIRMADA em leituras que falharam, números fora do `trecho_literal` (F17, F19, F27, F28), F29 com preço ambíguo em linha CONFIRMADO, notas de inferência sem rótulo, F10 x F19 com conflito falso documentado, IOSS em F23 fora do trecho.
- Lacunas: nenhum dado de demanda; nenhum preço, frete ou prazo de produto confirmado; taxas de canal para a Espanha ausentes; conformidade (contato com alimento, níquel, chumbo e cádmio, GPSR na oferta) sem confirmação; sem dados de pagamento e câmbio para R$ 0.

## Rodada 2 – correções e parecer do Lucas
- Correções do CSV: 10 corrigidas, 4 parciais (F17, F19, unidades em F15/F17, F36). Alex tratou os resíduos depois.
- Parecer do Lucas: **aceitável com ressalvas**, não precisa ser refeito. Aritmética refeita e batendo (eBay 21,20; Amazon Professional 21,25; Amazon Individual 20,26; TikTok 23,50; Shopify Payments ≈ 23,98; Espanha ≈ 20,98).
- Correções pedidas ao parecer:
  1. Retirar "base inclui frete" como dado confirmado (F19).
  2. Rotular o 6% do TikTok e categorias da Amazon que estavam fora do trecho.
  3. Reescrever a conclusão do eBay como único R$ 0: o valor mensal da loja é dado ausente, não ausência confirmada, e a Amazon Individual está em situação equivalente.
  4. Corrigir "taxas entre 6% e 19%".
  5. Rotular como inferência: "compra antecipada" (CJ), "marca branca/suspensão" (Amazon), "assume tudo, inclusive tributos" (Shopify).
  6. Trocar referência F36 por F34 e remover a citação "leitura provável" de F29.
  7. Uniformizar a classificação de sazonalidade e kits (C08/C20 x C18/C28, C21 x C30, C02/C27).
  8. Incluir o IOSS pendente (F23) na decisão sobre os 3 EUR.

## Rodada 3 – linhas novas do CSV e `lucas_rodada2.md`
- Esquema: 90 linhas com 19 campos, nenhum campo vazio.
- Contas refeitas à mão: todas as margens e preços mínimos de eBay e Amazon Individual batem. Divergência de arredondamento só em C05 com frete 3 (35,7% deveria ser 35,6%). O preço mínimo de C07 no custo 0,23 é 1,52 por causa da comissão mínima de 0,30, regra que o método não documentava.
- Veredito do parecer: **aceitável com ressalvas**. Correções pedidas (todas aplicadas depois):
  1. "É o único dos cinco" sobre C08 extrapola, porque C05 e C07 também têm preço mínimo abaixo da referência.
  2. Não usar o limite otimista 20,74 como parte da faixa recomendada.
  3. "Shopify Payments indisponível no Brasil" deve ser "Brasil não consta na lista lida".
  4. Afirmações de F37, F42, F43 e F44 estavam fora do trecho literal.
  5. "TikTok exige empresa dos EUA": F40 é condição suficiente, não necessariamente única.
  6. "None, I am an individual" é tipo de negócio, não plano Individual; Individual x Professional está em aberto para vendedor do Brasil.
  7. Documentar a comissão mínima de 0,30 e a premissa de frete não cobrado do cliente.
  8. Corrigir 35,7% e rotular P_min como estimativa.
  9. C07: incluir o extremo 17,88 e avisar que P=20 vem de rastreador da Amazon aplicado ao eBay.
  10. S05 cita "frete grátis" em snippet, não usado.
- **Pendente:** a versão revisada do parecer e as últimas correções do CSV não foram reauditadas por Sofia.
