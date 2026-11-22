# AI AGENT OFFICE CLOUD

Escritório virtual 2D em pixel art em que os personagens representam agentes **reais** do Claude Code. O estado de cada personagem vem de eventos publicados pelas sessões; sem dado recente, o personagem aparece como **desconhecido**. Nada é simulado.

- Acesso: página estática (GitHub Pages) em `https://thiagosgrdev.github.io/ai-agent-office-cloud/`, no celular e no computador.
- Custo adicional: R$ 0 (GitHub Pages em repositório público + sua assinatura Claude existente). Sem API paga, servidor ou cartão.
- Detalhes técnicos: [ARCHITECTURE.md](ARCHITECTURE.md).

## Equipe

| Agente | Função | Situação |
|---|---|---|
| Alex | Project Manager | **Ativo** (sessão principal, via `"agent": "alex"`) |
| Lucas | Full Stack Developer | **Ativo** (subagente) |
| Sofia | QA Engineer | **Ativo** (subagente) |
| Arthur, Noah, Maya, Ethan, Olivia | Arquiteto, Segurança, UI/UX, DevOps, Pesquisa | Em espera (`agents-standby/`) |

## Como usar

1. Abra uma sessão do Claude Code (web ou app) **neste repositório**. O Alex assume como sessão principal e delega a Lucas e Sofia. Os hooks de `.claude/settings.json` registram o estado e publicam um snapshot sanitizado na branch `data`.
2. Abra a URL do escritório. A página lê `data/status.json` a cada 60 s.
3. O escritório tem vida: quem está **ocioso** passeia (café, sofá, quadro, plantas, ronda); quem **trabalha** fica digitando na mesa; uma **conclusão nova** é comemorada e o relatório vai à mesa do Alex; o **fim real de uma execução** reúne a equipe na sala de reunião. As placas sempre mostram o estado e a idade reais; o movimento é só ilustração dentro do que o estado permite (detalhes em [ARCHITECTURE.md](ARCHITECTURE.md)).
4. Controles: **Pausar** (para só a animação, os dados continuam), **Reduzir animações**, **− / +** e **Ajustar** (zoom), arrastar para mover, pinça ou roda do mouse para zoom, toque duplo para reiniciar a visão.

## Como interromper

- Interrompa a sessão do Claude Code pelo app/web como de costume; ao encerrar, o hook de `Stop` publica o Alex como ocioso.
- Se uma sessão sumir sem encerrar, o frontend expira o "trabalhando" em 6 min e mostra "desconhecido".
- Para parar a publicação: remova os hooks `SubagentStop`/`Stop` de `.claude/settings.json`.

## Como adicionar ou ativar um especialista

- Mova `agents-standby/<id>.md` para `.claude/agents/<id>.md`. Cada subagente carregado aumenta o contexto (e o consumo da cota) de toda sessão, então ative só os necessários.
- O personagem já existe no escritório; ele passa de "em espera" a refletir os eventos assim que o hook publicar estados dele.
- Um agente novo exige uma entrada em `docs/js/config.js` (`AGENTS`), em `KNOWN` no `office_hook.py` e uma posição em `DESK_ORDER` (`docs/js/layout.js`, que também define os trajetos).

## Testes

```bash
node tests/run.mjs      # frontend, estados obsoletos, movimento vs. evidência, mobile/desktop, segredos (Playwright; ~6 min)
ONLY=W4,W10 node tests/run.mjs   # roda só os cenários cujo nome começa com W4 ou W10
bash tests/hook_test.sh # hook: sanitização, limite de frequência, falhas e recuperação
```

## Limitações conhecidas

- **Atraso:** os dados chegam em lote, com até ~5 min de atraso (cache do GitHub) mais o intervalo entre pushes. Não é tempo real.
- **Público:** o repositório e o escritório são públicos; não há login no plano gratuito. Só estado e horários são publicados.
- **Só mostra o que as sessões publicam:** sessões iniciadas por você neste repositório. Nada é inferido.
- **Movimento é ilustrativo:** passeios e gestos não indicam atividade real. Só "ocioso" passeia, e a placa continua mostrando o dado real. Não há animação de "pesquisando" ou "consultando documentos": falta evidência confiável.
- **Estados ainda não ligados a eventos reais:** erro (existe o visual, mas nenhum evento verificado o aciona), pesquisando, testando, analisando e colaborando. `Notification` (bloqueado) ainda não foi observado numa sessão real.
- **Cota:** cada sessão consome da mesma cota do Claude Pro; o piso observado foi ~78 mil tokens de contexto por sessão. O consumo em % da cota não foi medido.
- **Relógio:** a idade dos dados usa o relógio do dispositivo; um relógio errado torna os estados desconhecidos.
