# Evidências de GCS — CodeLab

Registro das verificações exigidas pela atividade de Gerência de Configuração (ver [`../PLANO_GCS.md`](../PLANO_GCS.md)).

| # | Item | Onde verificar | Status |
|---|------|----------------|--------|
| 1 | Plano de GCS versionado como IC | [`docs/PLANO_GCS.md`](../PLANO_GCS.md) | OK |
| 2 | Repositório acessível | Repositório público: https://github.com/amandhakae/CodeLab | OK |
| 3 | Push direto na `main` recusado | Proteção da `main` com *Do not allow bypassing* (vale para admin). Este próprio arquivo só entrou via Pull Request porque o commit direto na `main` foi bloqueado. Saída do `git push` recusado: `push-recusado.png` | OK |
| 4 | Par de revisão com acesso de escrita | `soficris` — colaboradora (Write) e Code Owner em `.github/CODEOWNERS` | OK |
| 5 | Environments `staging` e `production` | `staging` (branch `main`); `production` com **revisora obrigatória `amandhakae`** e sem bypass de admin — ver [Deployments](https://github.com/amandhakae/CodeLab/deployments) | OK |

## Regras de proteção da `main`

- Pull Request obrigatório, 1 aprovação, aprovações antigas descartadas a cada novo commit
- Revisão de Code Owners obrigatória
- Status check `test` (CI) obrigatório e branch atualizada
- Sem bypass para administradores; force push e exclusão bloqueados

## Saída esperada do push direto

```
$ git push origin main
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: - Changes must be made through a pull request.
 ! [remote rejected] main -> main (protected branch hook declined)
```
