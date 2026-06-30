
Plataforma de desafios de programação desenvolvida com Node.js aplicando TDD.

## Tecnologias

- Node.js + Express 5
- EJS + express-ejs-layouts
- Sequelize + MySQL
- Vitest + Supertest + nock
- bcryptjs, express-session, Multer
- ESLint

## Instalação

```bash
npm install
```

Criar arquivo `.env`:

```
PORT=3000
DB_NAME=codelab_tdd
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306
SESSION_SECRET=codelab_tdd
```

## Scripts

```bash
npm run dev          # servidor com nodemon
npm test             # testes (Vitest)
npm run test:coverage  # cobertura de código
npm run lint         # ESLint
```


91 testes organizados em 12 arquivos, cobrindo:

- Unitários: services e controllers com vi.mock(), vi.fn() e vi.spyOn()
- Integração: rotas HTTP com Supertest (service mockado)
- API externa: nock interceptando chamadas axios

src/
  modules/
    auth/        login, cadastro, bcrypt
    user/        perfil, foto, rating
    challenges/  desafios por nivel e categoria
    solutions/   submissao e pontuacao
    comments/    comentarios e avaliacao por estrelas
    category/    categorias dos desafios
    admin/       painel administrativo
    general/     rankings e comunidade
  constants/     dados compartilhados
  views/         paginas EJS
  public/        CSS, uploads
test/
  integration/   testes Supertest
  setup.js       configuracao global
```
