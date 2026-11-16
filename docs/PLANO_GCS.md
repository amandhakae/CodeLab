# Plano de Gerência de Configuração de Software (GCS) — CodeLab

| Item | Valor |
|------|-------|
| Projeto | CodeLab — plataforma de desafios de programação (Node.js/Express, TDD) |
| Repositório | https://github.com/amandhakae/CodeLab |
| Responsável (gerente de configuração) | Amandha Kae (`amandhakae`) |
| Versão do plano | 1.0 |
| Status | Item de configuração versionado — alterações somente via Pull Request |

---

## 1. Objetivo e escopo

Este plano define **como os artefatos do CodeLab são identificados, versionados, alterados, revisados, integrados e liberados**, garantindo rastreabilidade entre requisito → issue → branch → commit → PR → deploy.

Aplica-se a todo o conteúdo do repositório: código-fonte, testes, documentação, configuração de pipeline e dependências.

## 2. Papéis e responsabilidades

| Papel | Quem | Responsabilidade |
|-------|------|------------------|
| Gerente de configuração / mantenedora | `amandhakae` | Mantém este plano, regras de proteção da `main`, environments e releases; **revisora obrigatória do environment `production`** |
| Par de revisão | `soficris` — colaboradora com permissão **Write** | Revisa e aprova PRs; pode abrir branches e PRs |
| Pipeline (GitHub Actions) | `.github/workflows/ci.yml` | Executa lint/testes a cada push/PR e realiza os deploys em `staging` e `production` |

A atribuição automática de revisores é feita por `.github/CODEOWNERS`.

## 3. Itens de configuração (ICs)

| IC | Localização | Observação |
|----|-------------|------------|
| Código-fonte da aplicação | `src/`, `app.js` | Módulos: auth, user, challenges, solutions, lessons, comments, category, admin |
| Testes | `test/`, `src/**/__tests__/` | Unitários, integração (Supertest), E2E (Playwright), mutação (Stryker) |
| Dependências | `package.json`, `package-lock.json` | Lockfile sempre versionado junto |
| Configuração de ferramentas | `eslint.config.js`, `vitest.config.js`, `playwright.config.js`, `stryker.config.mjs` | |
| Pipeline CI/CD | `.github/workflows/` | |
| Governança do repositório | `.github/CODEOWNERS`, `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/` | |
| Modelo de configuração de ambiente | `.env.example` | O `.env` real **não** é versionado |
| Documentação | `README.md`, `RELATORIO*.md`, `diagrama.png`, `docs/` | Inclui **este plano** (`docs/PLANO_GCS.md`) |

**Fora do controle de versão** (ver `.gitignore`): `node_modules/`, `coverage/`, `.env`, `playwright-report/`, `test-results/`, `reports/`, `.stryker-tmp/`.

## 4. Estrutura do repositório

```
CodeLab/
├── .github/            # CI/CD, CODEOWNERS, templates de PR e issue
├── docs/               # Plano de GCS e documentação de processo
├── src/
│   ├── modules/        # um diretório por domínio (routes/controller/service/model + __tests__)
│   ├── views/          # EJS (layouts e pages)
│   ├── public/         # CSS e estáticos
│   ├── database/       # conexão Sequelize
│   └── server.js
├── test/               # integração e E2E
├── .env.example
└── package.json
```

## 5. Estratégia de ramificação (branching)

Modelo **GitHub Flow** com `main` protegida:

- `main` — linha de base estável; sempre implantável. **Não aceita push direto.**
- Branches de trabalho criadas a partir da `main`, com prefixo por tipo:
  - `feat/<issue>-<descricao>` — nova funcionalidade
  - `fix/<issue>-<descricao>` — correção de defeito
  - `docs/…`, `chore/…`, `test/…`, `refactor/…`
- Branches são apagadas após o merge.

## 6. Convenções de commit e PR

- Mensagens no padrão **Conventional Commits**: `tipo(escopo): descrição` — ex.: `feat(lessons): marca lição como concluída`.
- Título do PR no mesmo padrão; corpo segue `.github/pull_request_template.md`.
- PR referencia a issue (`Closes #N`) para rastreabilidade.

## 7. Controle de mudanças

1. Toda mudança nasce de uma **issue** (templates *Defeito* ou *Funcionalidade*).
2. Desenvolvimento em branch própria.
3. Abertura de **Pull Request** para `main`.
4. **Regras de proteção da `main`** (Settings → Branches/Rules):
   - Pull Request obrigatório antes do merge (push direto bloqueado);
   - Mínimo de **1 aprovação**; aprovações descartadas quando há novo commit;
   - Revisão de Code Owners exigida;
   - Status check **CI** obrigatório e branch atualizada com a `main`;
   - Bloqueio de *force push* e de exclusão da branch;
   - Regras aplicadas também a administradores.
5. Merge apenas com CI verde e aprovação do par de revisão.

**Evidência:** tentativa de `git push origin main` é recusada pelo GitHub com `GH006: Protected branch update failed` / `Changes must be made through a pull request` (registro em `docs/evidencias/`).

## 8. Integração contínua

Workflow `.github/workflows/ci.yml`, disparado em `push` e `pull_request` para `main`:

1. Checkout e Node.js 20;
2. `npm install`;
3. `npm run test:run` (unitários + integração);
4. Testes E2E com Playwright (MySQL 8 como service container);
5. Publicação do relatório Playwright como artefato.

## 9. Ambientes e implantação

| Environment | Quando | Proteção |
|-------------|--------|----------|
| `staging` | Automático após CI verde na `main` | Restrito à branch `main` |
| `production` | Após `staging` | **Revisora obrigatória: `amandhakae`** (deploy só segue após aprovação manual); restrito à branch `main` |

Segredos de cada ambiente (ex.: `DB_PASSWORD`, `SESSION_SECRET`) ficam em *Environment secrets* do GitHub, nunca no código.

## 10. Baselines, versionamento e releases

- Versionamento **SemVer** (`MAJOR.MINOR.PATCH`), refletido em `package.json`.
- Cada liberação em produção gera **tag anotada** `vX.Y.Z` e uma *GitHub Release* com notas de mudança.
- Baselines: cada tag é uma baseline; a `main` é a baseline corrente.

## 11. Auditoria e status da configuração

- Histórico de mudanças: log do Git, PRs e issues (rastreabilidade issue ↔ PR ↔ commit).
- Histórico de deploys: aba *Environments* / *Deployments* do GitHub.
- Revisão periódica (a cada entrega da disciplina): conferir regras de proteção, colaboradores, environments e se este plano reflete o processo real.

## 12. Manutenção deste plano

Este documento é um IC: alterações seguem o mesmo fluxo (branch `docs/…` + PR + aprovação).
