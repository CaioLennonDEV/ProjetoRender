import pg from 'pg';
import dotenv from 'dotenv';

// Carregar .env apenas em desenvolvimento (local)
// No Render, as variáveis de ambiente são configuradas no painel
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const { Pool } = pg;

// Suportar tanto connection string quanto variáveis individuais
let poolConfig: pg.PoolConfig;

// Log das variáveis disponíveis (sem mostrar valores sensíveis)
console.log('🔍 Verificando variáveis de ambiente...');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurado' : '❌ Não configurado');
console.log('   DB_HOST:', process.env.DB_HOST ? '✅ Configurado' : '❌ Não configurado');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

if (process.env.DATABASE_URL) {
  // Usar connection string se disponível
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Necessário para conexões SSL do Render
    },
  };
  console.log('🔧 Usando connection string do DATABASE_URL');
} else if (process.env.DB_HOST) {
  // Usar variáveis individuais
  poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
  };
  console.log('🔧 Usando variáveis individuais de conexão');
} else {
  const errorMsg = `
❌ Nenhuma configuração de banco de dados encontrada!

Para configurar no Render:
1. Acesse o painel do seu serviço no Render
2. Vá em "Environment" (Variáveis de Ambiente)
3. Adicione a variável DATABASE_URL com o valor:
   postgresql://testeinova_user:5FdC9e4aEYutv82bKyuWcT4alEnWWxv1@dpg-d4krmb3e5dus73fe18ag-a.oregon-postgres.render.com:5432/testeinova

Ou configure as variáveis individuais:
- DB_HOST=dpg-d4krmb3e5dus73fe18ag-a.oregon-postgres.render.com
- DB_PORT=5432
- DB_NAME=testeinova
- DB_USER=testeinova_user
- DB_PASSWORD=5FdC9e4aEYutv82bKyuWcT4alEnWWxv1
  `.trim();
  throw new Error(errorMsg);
}

const pool = new Pool(poolConfig);

// Testar conexão ao inicializar
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL');
    console.log(`📊 Banco: ${process.env.DB_NAME}`);
    client.release();
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error);
  }
})();

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do PostgreSQL:', err);
});

export default pool;

