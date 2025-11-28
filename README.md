# Cronograma Gantt Chart - Planejamento e Inovação

Aplicação web React + TypeScript para visualização de cronograma anual em formato Gantt Chart e tabela.

## Funcionalidades

- 📊 Visualização interativa em Gantt Chart
- 📋 Tabela organizada com todos os eventos
- 💾 Banco de dados PostgreSQL
- 📥 Exportação para CSV
- 📱 Design responsivo mobile-first

## Tecnologias

- React 18 + TypeScript
- Redux Toolkit para gerenciamento de estado
- Shadcn UI para componentes
- Frappe Gantt para visualização do cronograma
- PostgreSQL para banco de dados
- Express.js para API backend
- Tailwind CSS para estilização
- Vite como build tool

## Instalação

```bash
yarn install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente do PostgreSQL:

```bash
cp .env.example .env
```

2. Edite o `.env` com suas credenciais do PostgreSQL:
```
DB_HOST=seu_host
DB_PORT=5432
DB_NAME=seu_banco
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

3. Inicialize o banco de dados (execute apenas uma vez):

```bash
yarn api:init
```

## Desenvolvimento

Em terminais separados:

```bash
# Terminal 1: Frontend
yarn dev

# Terminal 2: API Backend
yarn api:dev
```

## Build

```bash
# Build do frontend
yarn build

# O servidor integrado (server.js) serve tanto a API quanto os arquivos estáticos
yarn start
```

## Estrutura do Projeto

```
├── api/
│   ├── db.ts             # Configuração PostgreSQL
│   ├── server.ts         # Servidor Express
│   ├── routes/
│   │   └── cronograma.ts # Rotas CRUD da API
│   └── scripts/
│       └── init-db.ts    # Script de inicialização do banco
├── src/
│   ├── app/
│   │   └── page.tsx          # Página principal
│   ├── components/
│   │   ├── ui/               # Componentes Shadcn UI
│   │   ├── GanttChart.tsx    # Componente Gantt Chart
│   │   ├── CronogramaTable.tsx # Componente Tabela
│   │   └── ExportButton.tsx  # Botão de exportação
│   ├── db/
│   │   ├── init.ts           # Interface para API
│   │   └── types.ts          # Tipos TypeScript
│   ├── lib/
│   │   └── api.ts            # Cliente HTTP para API
│   ├── hooks/
│   │   └── useCronograma.ts  # Hook customizado
│   ├── store/
│   │   ├── store.ts          # Configuração Redux
│   │   └── cronogramaSlice.ts # Slice Redux
│   └── utils/
│       └── csvExport.ts      # Função de exportação CSV
└── server.js                  # Servidor integrado (API + estáticos)
```

## Banco de Dados

O banco PostgreSQL é inicializado com os seguintes eventos:

- Janeiro: Levantamento de nomes dos embaixadores
- Fevereiro-Março: Capacitação de Embaixadores
- Abril-Maio: Inova + Saúde
- Junho-Julho: Impulsione
- Agosto-Outubro: Piloto Impulsione
- Novembro: Oscar da Inovação
- Dezembro: Anúncio da Inovação

## Exportação CSV

Clique no botão "Exportar para CSV" para baixar todos os dados do cronograma em formato CSV.

