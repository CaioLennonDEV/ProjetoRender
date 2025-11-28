# Cronograma Gantt Chart - Planejamento e Inovação

Aplicação web React + TypeScript para visualização de cronograma anual em formato Gantt Chart e tabela.

## Funcionalidades

- 📊 Visualização interativa em Gantt Chart
- 📋 Tabela organizada com todos os eventos
- 💾 Banco de dados SQLite (sql.js) no navegador
- 📥 Exportação para CSV
- 📱 Design responsivo mobile-first

## Tecnologias

- React 18 + TypeScript
- Redux Toolkit para gerenciamento de estado
- Shadcn UI para componentes
- Frappe Gantt para visualização do cronograma
- SQL.js para banco SQLite no navegador
- Tailwind CSS para estilização
- Vite como build tool

## Instalação

```bash
yarn install
```

## Desenvolvimento

```bash
yarn dev
```

## Build

```bash
yarn build
```

## Estrutura do Projeto

```
src/
├── app/
│   └── page.tsx          # Página principal
├── components/
│   ├── ui/               # Componentes Shadcn UI
│   ├── GanttChart.tsx    # Componente Gantt Chart
│   ├── CronogramaTable.tsx # Componente Tabela
│   └── ExportButton.tsx  # Botão de exportação
├── db/
│   ├── schema.sql        # Schema do banco
│   ├── init.ts           # Inicialização do banco
│   └── types.ts          # Tipos TypeScript
├── hooks/
│   └── useCronograma.ts  # Hook customizado
├── store/
│   ├── store.ts          # Configuração Redux
│   └── cronogramaSlice.ts # Slice Redux
└── utils/
    └── csvExport.ts      # Função de exportação CSV
```

## Banco de Dados

O banco SQLite é inicializado automaticamente no navegador com os seguintes dados:

- Janeiro: Levantamento de nomes dos embaixadores
- Fevereiro-Março: Capacitação de Embaixadores
- Abril-Maio: Inova + Saúde
- Junho-Julho: Impulsione
- Agosto-Outubro: Piloto Impulsione
- Novembro: Oscar da Inovação
- Dezembro: Anúncio da Inovação

## Exportação CSV

Clique no botão "Exportar para CSV" para baixar todos os dados do cronograma em formato CSV.

