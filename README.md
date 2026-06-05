# AY Hub

Sistema web para gestão diária da agência AY Social Media.

## Etapa 1 entregue

- Estrutura inicial separando `frontend` e `backend`
- Back-end Node.js + Express
- Banco SQLite com tabelas base dos módulos
- Autenticação simples com login e senha
- Dashboard inicial com métricas vindas da API
- Layout SaaS com sidebar responsiva
- Front-end React + Vite

## Como rodar

Instale as dependências:

```bash
npm run install:all
npm install
```

Rode o sistema:

```bash
npm run dev
```

Esse comando compila o front-end e sobe:

- Sistema: http://localhost:3333
- API: http://localhost:3333/api/health

Modo desenvolvimento com hot reload:

```bash
npm run dev:hot
```

Ou rode separado:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

URLs:

- Sistema: http://localhost:3333
- Front-end em preview: http://localhost:4173
- Front-end em hot reload: http://localhost:5173
- Back-end: http://localhost:3333


Você pode alterar as credenciais criando `backend/.env`:

```env
PORT=3333
AUTH_EMAIL=arthurpsantos05@gmail.com
AUTH_PASSWORD=sua-senha
DATABASE_PATH=C:\Users\arthu\OneDrive\Documentos\ayhub\backend\data\ayhub.db
```

## Banco de dados

O AY Hub esta conectado a um banco SQLite local. Por padrao, o arquivo fica em:

```text
backend/data/ayhub.db
```

Status da conexao:

```text
http://127.0.0.1:3333/api/db/status
```

## Usuarios

O login consulta a tabela `users`. O usuario inicial e criado automaticamente:

- E-mail: `arthurpsantos05@gmail.com`
- Senha: `ayhub123`
- Perfil: `admin`

No painel, acesse **Usuarios** para cadastrar socias e funcionarios.

## Próximas etapas

1. CRUD de clientes
2. Propostas e PDF
3. Financeiro
4. Calendário de conteúdo
5. Tarefas e estudos
6. Melhorias visuais e responsividade
