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

## Renderização e consumo

- O mapa é um canvas **pequeno** (176×320 em pé, 352×176 deitado) ampliado por CSS (`image-rendering: pixelated`, escala inteira); as placas são DOM, atualizadas só quando o dado muda.
- Laço: ~12 quadros/s **somente enquanto algo se move ou digita**; caso contrário, um tick de 4 Hz sem repintar. Gestos estáticos repintam só ao começar e ao terminar.

## Publicação sem bloquear a sessão (`office_hook.py`)

Sempre sai com código 0, nunca imprime, leitura de stdin com limite de 5 s, prazo de 25 s para o git, no máximo um push a cada 30 s (o `Stop` sempre publica), só publica se o estado mudou, e retoma sozinho após uma falha. Todos os comandos em `settings.json` terminam com `|| true`, para que até um script ausente (código de saída 2, que bloquearia o `Stop`) não possa bloquear a sessão.

## Segurança

- Sem credenciais no frontend nem no repositório. CSP restringe a página a si mesma e a `raw.githubusercontent.com`.
- Dados externos só entram no DOM por `textContent`.
- Repositório **público**: qualquer pessoa com a URL vê o escritório. Sem login possível no plano gratuito (Pages privado exige plano pago).

## Fora do escopo desta fase

Painel de detalhes por clique, dashboard, Central de Comando, Agent Teams, rotinas agendadas, ativação dos 5 agentes em espera, e animações de "pesquisando", "testando" ou "consultando documentos" (não há evidência confiável para elas: os hooks não publicam nomes de ferramenta e o atraso chega a 5 min).
