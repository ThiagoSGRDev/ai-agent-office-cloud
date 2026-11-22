# Arquitetura (Fase 1 / MVP)

```
Sessão Claude Code (nuvem)                    GitHub (repo público)                 Navegador
  Alex = sessão principal (settings "agent")     branch main  → /docs (GitHub Pages)  ──►  escritório (Canvas 2D)
   ├─ subagent Lucas                             branch data  → status.json           ──►  fetch a cada 60 s
   └─ subagent Sofia                                  ▲
   hooks ► office_hook.py ► status/ (local, ignorado)  │ git push (apenas em SubagentStop e Stop)
                         └► snapshot SANITIZADO ───────┘
```

Sem servidor, sem build, sem dependências. O frontend só **lê** um JSON público.

## Contrato de dados (`data/status.json`, schema 1)

```json
{ "schema": 1, "generated_at": 1795308403,
  "agents": { "alex": { "state": "idle", "updated_at": 1795308403, "last_event": "Stop" } } }
```

- Estados publicados: `idle`, `working`, `completed`, `blocked` (o frontend também aceita `error`, que o hook atual **não** envia).
- **Nada além disso** é publicado: sem tarefa, prompt, caminho, nome de ferramenta, `cwd`, id de sessão ou mensagens. O hook monta o JSON por lista de campos permitidos e recusa publicar se o texto tiver caracteres fora de um conjunto seguro.

## Mapeamento evento → estado (comprovado na nuvem)

| Evento do Claude Code | Estado |
|---|---|
| `SessionStart`, `Stop` (só da sessão principal) | `idle` |
| `SubagentStart`, `PreToolUse` | `working` |
| `SubagentStop` | `completed` |
| `Notification` | `blocked` (ainda **não observado** em sessão real) |

`Stop` encerra o turno da sessão principal; subagentes podem continuar em segundo plano, então o `Stop` **não** altera o estado deles.

### Quem pode mudar o estado (classificação no hook)

Observado em sessão real: o Claude Code dispara `SubagentStop` com `agent_type` igual ao agente principal (`alex`) e um `agent_id`, ao fim de cada turno, **sem** `SubagentStart` e sem subagente algum. Tratar isso como "subagente concluiu" mostrava Alex como `completed` em vez de `idle`. Regras atuais de `office_hook.py`:

- Sem `agent_id`, o evento é da sessão principal: `Stop` → Alex `idle`, `PreToolUse` → Alex `working`.
- `SubagentStart` com `agent_id` e `agent_type` de um subagente conhecido (diferente de `alex`) registra o id numa tabela **local** (`status/subagents.json`, git-ignorada) e marca o agente `working`.
- `SubagentStop` só conclui (`completed`) um agente quando o `agent_id` e o tipo batem com um início registrado. Com `agent_type` `alex`, vazio, desconhecido, sem id ou sem início correspondente, é **ignorado**: o estado público não muda.
- `PreToolUse`/`Notification` dentro de um subagente só valem se o id estiver registrado (e renovam o registro). Qualquer outro evento com `agent_id` é ignorado.
- Fora de ordem: um `SubagentStop` sem início fica guardado por 120 s (tabela `early`); se o `SubagentStart` do mesmo id chegar nessa janela, o início tardio não reabre o agente: ele fica `completed` quando não existe outra instância ativa do mesmo tipo (`start-after-stop`) e permanece `working` quando existe (a outra instância ainda está rodando). Em nenhum caso o id tardio fica registrado como ativo.
- Duplicados: ao concluir um subagente, o id fica 120 s na tabela `done`. Um `SubagentStart` (ou `SubagentStop`) repetido para esse id e tipo é ignorado (`duplicate-start-after-stop` / `duplicate-stop`), então o agente continua `completed`. Passada a janela o id pode ser reutilizado; um duplicado que chegue mais de 120 s depois do fim volta a registrar o agente e é limpo pela expiração abaixo.
- Várias instâncias do mesmo agente: o estado público é um por nome. Um `SubagentStop` (ou um `SubagentStart` tardio de um id já encerrado) só deixa o agente `completed` quando não resta nenhuma outra instância ativa daquele tipo; enquanto houver, o agente continua `working` (`stop-matched-others-active`).
- `status/status.json` inválido: se o arquivo local for JSON malformado, vazio ou de forma errada (lista, string, número, booleano, `null`, `agents` que não seja objeto), ele é recriado no próximo evento e as entradas de agente que não sejam objetos são descartadas; as válidas são preservadas. A recuperação fica em `events.jsonl` (`recovery`: `malformed-json`, `not-an-object`, `agents-not-an-object`, `invalid-agent-entries` ou `unreadable`) e em `publish.log`, só com o rótulo, nunca com o conteúdo.
- Expiração: registros sem atividade por 30 min (igual ao `STALE_S` do frontend) são descartados, e um subagente que ficou `working` sem registro vivo volta a `idle` (nunca a `completed`). Limitação: só `PreToolUse`/`Notification` renovam o registro; um subagente que fique mais de 30 min sem nenhum desses eventos (por exemplo uma única ferramenta longa) perde o registro, seu `SubagentStop` real é ignorado e ele termina em `idle`, não em `completed`.
- Limite da tabela `status/subagents.json`: no máximo **64 registros ativos** (todos os tipos juntos) mais até **64 em `early`** e **64 em `done`** (no máximo 192 ids no total). Um registro ativo nunca é expulso: com 64 ativos, novos `SubagentStart` são ignorados (`registry-full`, auditado) e o agente novo não aparece como `working`, o que evita um `working` preso por falta de correlação. As tabelas `early` e `done` perdem primeiro os registros mais antigos. Limitação: com 64 subagentes simultâneos, o 65º fica invisível até haver vaga.
- Concorrência: a leitura do relógio, a leitura e a gravação (atômica) da tabela acontecem dentro do mesmo lock do `record()`. Um carimbo até 60 s no futuro (relógio lido por hooks concorrentes) é tolerado; carimbos mais distantes no futuro são descartados.
- Todo evento fica em `status/events.jsonl` com `accepted` e `reason` (inclusive os ignorados). O `agent_id` aparece lá só como impressão curta (`agent_ref`).
- Nunca são publicados `agent_id`, caminho de transcript, prompt ou mensagens: o schema e a lista de campos permitidos continuam os mesmos.

## Proteção contra estados obsoletos (`docs/js/state.js`)

Idade = relógio do navegador − `updated_at`.

| Situação | O que é exibido |
|---|---|
| ≤ 6 min | O estado publicado |
| 6–30 min | `working`/`blocked`/`error` viram **desconhecido**; `idle`/`completed` permanecem, com a idade |
| > 30 min | Tudo desconhecido, com faixa "Sem dados recentes" |
| Falha de rede, HTTP ≠ 200, JSON inválido, `schema` ≠ 1, payload > 20 KB | Tudo desconhecido, com faixa. O último dado bom é descartado. |
| Estado fora da lista, agente fora da lista | Desconhecido / ignorado |
| Data no futuro (> 60 s) | Desconhecido ("relógio") |
| Agente de reserva sem dado | "Em espera" |

Limites em `docs/js/config.js`. O atraso total esperado é de até ~5 min (cache do `raw.githubusercontent.com`) mais o intervalo entre pushes (≥ 30 s).

## Movimento e comportamento (camada decorativa, `docs/js/scene.js`)

O que é **verdade** (estado e idade) vem só de `state.js` e aparece nas placas. O movimento é uma camada separada, que só pode fazer o que a evidência permite:

| Estado resolvido | O que o personagem pode fazer |
|---|---|
| `working` | Fica na mesa: digita, olha a tela, pensa (mão no rosto). **Nunca sai.** |
| `blocked` | Fica na mesa, cabeça nas mãos, balão `!`. **Nunca sai.** |
| `unknown` / obsoleto | **Congelado e cinza**, sem gestos. O laço de animação dorme. |
| `standby` | Cadeira vazia. Ninguém se move. |
| `idle` | Gestos raros (olhar, tomar café, bocejar) e passeios com propósito, ver abaixo. |
| `completed` novo | Comemora; um subagente pode entregar o relatório na mesa do Alex. |

- **Se o dado mudar** (por exemplo, para `working`), o personagem aparece sentado **na hora**, sem caminhar de volta.
- **Reações só nascem de transições observadas depois do carregamento** (nunca reencenam o histórico). Comparação por (`state`, `updated_at`), mantida entre falhas de rede, então uma reconexão não repete.
- **Reunião:** apenas uma por execução (cooldown de 5 min), quando o Alex fica `idle` com `last_event = Stop`, há subagentes `completed` na mesma janela e ninguém está `working`. Uma conclusão isolada **não** vira reunião (só comemoração e entrega).
- **Passeios de descanso** (só `idle`): café, sofá, quadro da sala de reunião, planta, alongar, ronda pelas mesas. Cada agente tem pesos e intervalos próprios (`PERSONA` em `config.js`), não repete a mesma atividade em seguida, no máximo 2 caminham ao mesmo tempo, e as vagas (café, sofá…) são reservadas. O primeiro passeio ocorre 6 a 16 s depois de ficar ocioso; os seguintes, a cada 2 a 5 min.
- **Trajetos:** grafo de pontos por layout (corredores entre as mesas, sem atravessar móveis ou placas) com menor caminho. Quem sai da mesa passa por trás dela.
- **Movimento reduzido / Pausar / aba oculta:** ninguém se desloca; todos ficam na mesa.

## Renderização, nitidez e consumo

- O mapa é um canvas **pequeno** (176×320 em pé, 352×176 deitado) ampliado por CSS (`image-rendering: pixelated`, **escala inteira em pixels de tela**); as placas são DOM, atualizadas só quando o dado muda.
- **Alinhamento de pixels inteiros:** os deslocamentos do mapa (centralização, zoom e arrasto) são arredondados a pixels de tela inteiros, e todos os sprites são desenhados em coordenadas inteiras. Um deslocamento de meio pixel faria o compositor reamostrar (borrar) o canvas. Não há `will-change` no mapa.
- **Teste de nitidez** (`N1` em `tests/run.mjs`): captura a página real em 6 densidades de tela (1×, 1,25×, 1,5×, 2×, 2,75×, 3×, com tamanhos ímpares), ajustada, com zoom e com arrasto fracionário, e mede **pixels isolados** (cor diferente dos dois vizinhos). Com escala inteira o resultado é ~0%; com interpolação ligada sobe para 12–18%. O teste reprova acima de 1%.
- Laço: ~12 quadros/s **somente enquanto algo se move ou digita**; caso contrário, um tick de 4 Hz sem repintar. Gestos estáticos repintam só ao começar e ao terminar.

## Personagens (`docs/js/characters.js`)

Estilo "gente de bloco": cabeça grande e arredondada, corpo compacto, mãos de luva, rosto simples (olhos 2×3 com brilho, sorriso de 4 px, óculos com lente branca e pupila) e contorno na cor de cada peça. Cada agente tem cabelo, roupa e acessório próprios (Alex: terno e óculos prateados; Arthur: colete e bigode; Lucas: moletom e fones; Sofia: blazer e crachá; Noah: touca e colete; Maya: boina e cachecol; Ethan: boné e óculos ciano; Olivia: coque redondo com fita e cardigã).

- Tudo é desenhado por código (sem imagens externas, sem licenças). Caixa de 16×26 px, pés na última linha.
- **Regra do rosto:** nenhum cabelo, touca ou boné toca as linhas dos olhos; o rosto só espelha o **estado real** (focado, feliz, preocupado, cinza) e nunca inventa um.
- Poses: sentado (digitando, ocioso, comemorando, bloqueado, desconhecido), em pé de frente/lado/costas, caminhada de 4 quadros, e gestos (olhar, pensar, tomar café, bocejar, negar, regar, apontar, entregar relatório).

## Publicação sem bloquear a sessão (`office_hook.py`)

Sempre sai com código 0, nunca imprime, leitura de stdin com limite de 5 s, prazo de 25 s para o git, só publica se o estado mudou, e retoma sozinho após uma falha. Estados finais (`Stop` e `SubagentStop`) nunca são limitados por frequência nem descartados: o hook marca `status/.dirty` e um único publicador (`status/.publish.lock`, não bloqueante) republica o estado mais recente enquanto houver pendência; quem não obtém o lock sai na hora, e uma falha ou estouro de prazo deixa o `.dirty` para o próximo evento. Eventos não finais com `--publish` mantêm o limite de um push a cada 30 s. Todos os comandos em `settings.json` terminam com `|| true`, para que até um script ausente (código de saída 2, que bloquearia o `Stop`) não possa bloquear a sessão.

## Segurança

- Sem credenciais no frontend nem no repositório. CSP restringe a página a si mesma e a `raw.githubusercontent.com`.
- Dados externos só entram no DOM por `textContent`.
- Repositório **público**: qualquer pessoa com a URL vê o escritório. Sem login possível no plano gratuito (Pages privado exige plano pago).

## Fora do escopo desta fase

Painel de detalhes por clique, dashboard, Central de Comando, Agent Teams, rotinas agendadas, ativação dos 5 agentes em espera, e animações de "pesquisando", "testando" ou "consultando documentos" (não há evidência confiável para elas: os hooks não publicam nomes de ferramenta e o atraso chega a 5 min).
