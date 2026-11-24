# Regras do projeto

## Política operacional de Git

Vale para todas as sessões e agentes do projeto `ai-agent-office-cloud`.

**Papéis**
- Alex executa todos os comandos Git (commit e push).
- Lucas implementa dentro do escopo recebido.
- Sofia revisa de forma independente e somente leitura.
- Antes de qualquer commit, Alex apresenta a evidência da revisão da Sofia (PASS/FAIL com o conteúdo observado).

**Regras**
1. Commits só quando as alterações estiverem concluídas, revisadas e dentro do escopo da tarefa.
2. Antes do commit, executar `git status` e revisar integralmente o `git diff`.
3. Não incluir arquivos modificados por outras tarefas ou agentes sem autorização específica. Adicionar arquivos por caminho explícito, nunca com `git add -A` ou `git add .`.
4. Executar os testes pertinentes (`tests/`) e informar os resultados.
5. Push permitido somente para a branch de trabalho designada para a sessão atual. Nenhum push para outra branch sem autorização explícita.
6. Nunca usar force push, reescrever histórico compartilhado ou sobrescrever trabalho de terceiros.
7. Sem merge em `main`, deploy ou publicação em produção sem autorização explícita.
8. Sem compras, assinaturas, anúncios ou outras despesas sem autorização.
9. Sofia é revisora independente e não aprova alterações que ela própria implementou.
10. Todo commit e push é informado com hash, branch e resumo dos arquivos enviados.

**Observações**
- `status/` é publicado pelos hooks do escritório (branch `data`); ninguém edita esse diretório à mão.
- Esta política não altera hooks, `settings.json` nem permissões.
