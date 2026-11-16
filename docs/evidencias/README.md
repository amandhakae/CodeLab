# Evidências de GCS — CodeLab

Registro das verificações exigidas pela atividade de Gerência de Configuração (ver [`../PLANO_GCS.md`](../PLANO_GCS.md)).

| # | Item | Onde verificar | Status |
|---|------|----------------|--------|
| 1 | Plano de GCS versionado como IC | [`docs/PLANO_GCS.md`](../PLANO_GCS.md) | OK |
| 2 | Repositório acessível | Repositório público: https://github.com/amandhakae/CodeLab | OK |
| 3 | Push direto na `main` recusado | Proteção da `main` com *Do not allow bypassing* (vale para admin). O GitHub recusa o commit direto (*"You can't commit to main because it is a protected branch"*); este arquivo só entrou via [PR #2](https://github.com/amandhakae/CodeLab/pull/2), bloqueado até a revisão do Code Owner | OK |
| 4 | Par de revisão com acesso de escrita | [`@soficris`](https://github.com/soficris) — colaboradora (Write) e Code Owner em `.github/CODEOWNERS` | OK |
| 5 | Environments `staging` e `production` | `staging` (branch `main`); `production` com **revisora obrigatória `amandhakae`** e sem bypass de admin — ver [Deployments](https://github.com/amandhakae/CodeLab/deployments) | OK |

## Regras de proteção da `main`

- Pull Request obrigatório, 1 aprovação, aprovações antigas descartadas a cada novo commit
- Revisão de Code Owners obrigatória
- Status check `test` (CI) obrigatório e branch atualizada
- Sem bypass para administradores; force push e exclusão bloqueados

## Saída esperada do push direto via terminal

```
$ git push origin main
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: - Changes must be made through a pull request.
 ! [remote rejected] main -> main (protected branch hook declined)
```
