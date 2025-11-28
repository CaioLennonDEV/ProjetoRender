import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Suportar tanto connection string quanto variáveis individuais
let poolConfig: pg.PoolConfig;

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
  throw new Error('❌ Nenhuma configuração de banco de dados encontrada. Configure DATABASE_URL ou variáveis DB_*');
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

