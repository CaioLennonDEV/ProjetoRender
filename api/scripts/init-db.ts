import dotenv from 'dotenv';
dotenv.config();

import pool from '../db.js';

const eventosIniciais = [
  ['Janeiro', 'Levantamento de nomes dos embaixadores', 'Planejamento', '2025-01-01', '2025-01-31'],
  ['Fevereiro', 'Capacitação de Embaixadores', 'Capacitação', '2025-02-01', '2025-03-31'],
  ['Março', 'Capacitação de Embaixadores', 'Capacitação', '2025-02-01', '2025-03-31'],
  ['Fevereiro', 'Campanhas de ideias', 'Capacitação', '2025-02-01', '2025-04-30'],
  ['Março', 'Campanhas de ideias', 'Capacitação', '2025-02-01', '2025-04-30'],
  ['Abril', 'Campanhas de ideias', 'Capacitação', '2025-02-01', '2025-04-30'],
  ['Abril', 'Inova + Saúde', 'Inovação', '2025-04-01', '2025-05-31'],
  ['Maio', 'Inova + Saúde', 'Inovação', '2025-04-01', '2025-05-31'],
  ['Abril', 'Jornada da Inovação', 'Inovação', '2025-04-01', '2025-04-30'],
  ['Maio', 'Acelera', 'Inovação', '2025-05-01', '2025-05-31'],
  ['Junho', 'Impulsione', 'Inovação', '2025-06-01', '2025-07-31'],
  ['Julho', 'Impulsione', 'Inovação', '2025-06-01', '2025-07-31'],
  ['Junho', 'SW', 'Inovação', '2025-06-01', '2025-06-30'],
  ['Julho', 'Simpósio', 'Inovação', '2025-07-01', '2025-07-31'],
  ['Agosto', 'Piloto Impulsione', 'Projeto Piloto', '2025-08-01', '2025-10-31'],
  ['Setembro', 'Piloto Impulsione', 'Projeto Piloto', '2025-08-01', '2025-10-31'],
  ['Outubro', 'Piloto Impulsione', 'Projeto Piloto', '2025-08-01', '2025-10-31'],
  ['Novembro', 'Oscar da Inovação', 'Evento', '2025-11-01', '2025-11-30'],
  ['Dezembro', 'Anúncio da Inovação', 'Evento', '2025-12-01', '2025-12-31'],
];

async function initDatabase() {
  try {
    console.log('🔄 Inicializando banco de dados...');

    // Criar tabela
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cronograma (
        id SERIAL PRIMARY KEY,
        mes TEXT NOT NULL,
        atividade TEXT NOT NULL,
        categoria TEXT,
        inicio DATE,
        fim DATE
      )
    `);

    console.log('✅ Tabela criada/verificada');

    // Verificar se já existem dados
    const countResult = await pool.query('SELECT COUNT(*) FROM cronograma');
    const count = parseInt(countResult.rows[0].count);

    if (count === 0) {
      console.log('📝 Inserindo eventos iniciais...');

      // Inserir eventos iniciais
      for (const evento of eventosIniciais) {
        await pool.query(
          `INSERT INTO cronograma (mes, atividade, categoria, inicio, fim) 
           VALUES ($1, $2, $3, $4, $5)`,
          evento
        );
      }

      console.log(`✅ ${eventosIniciais.length} eventos inseridos com sucesso!`);
    } else {
      console.log(`ℹ️  Banco já possui ${count} eventos. Pulando inserção inicial.`);
    }

    await pool.end();
    console.log('✅ Inicialização concluída!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    await pool.end();
    process.exit(1);
  }
}

initDatabase();

