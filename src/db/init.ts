import initSqlJs, { Database } from 'sql.js';
import { CronogramaItem } from './types';

const STORAGE_KEY = 'cronograma_db';
let db: Database | null = null;

// Função para salvar o banco SQLite no localStorage
function saveDatabase(): void {
  if (!db) {
    console.warn('Tentativa de salvar banco, mas db não está inicializado');
    return;
  }
  
  try {
    // Exportar o banco SQLite completo (formato binário)
    const data = db.export();
    const buffer = Array.from(data);
    
    // Salvar no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer));
    
    // Verificar quantos registros temos no banco
    const countResult = db.exec('SELECT COUNT(*) as count FROM cronograma');
    const count = countResult.length > 0 && countResult[0].values.length > 0 
      ? countResult[0].values[0][0] as number 
      : 0;
    
    console.log(`✅ Banco SQLite salvo com sucesso! Total de registros: ${count}`);
  } catch (error) {
    console.error('❌ Erro ao salvar banco SQLite:', error);
  }
}

// Função para carregar o banco SQLite do localStorage
function loadDatabaseFromStorage(SQL: any): Database | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const buffer = JSON.parse(stored);
      const uint8Array = new Uint8Array(buffer);
      const loadedDb = new SQL.Database(uint8Array);
      
      // Verificar quantos registros temos no banco carregado
      try {
        const countResult = loadedDb.exec('SELECT COUNT(*) as count FROM cronograma');
        const count = countResult.length > 0 && countResult[0].values.length > 0 
          ? countResult[0].values[0][0] as number 
          : 0;
        console.log(`📂 Banco SQLite carregado do localStorage! Total de registros: ${count}`);
      } catch (e) {
        console.warn('Banco carregado mas sem schema válido');
      }
      
      return loadedDb;
    } else {
      console.log('📝 Nenhum banco SQLite encontrado no localStorage, criando novo...');
    }
  } catch (error) {
    console.error('❌ Erro ao carregar banco SQLite do storage:', error);
  }
  return null;
}

export async function initDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });

  // Tentar carregar do localStorage primeiro
  const loadedDb = loadDatabaseFromStorage(SQL);
  
  if (loadedDb) {
    db = loadedDb;
    // Verificar se o schema existe e está correto
    try {
      db.exec('SELECT COUNT(*) FROM cronograma');
      // Schema existe, garantir que está atualizado e retornar
      // Executar CREATE TABLE IF NOT EXISTS para garantir que o schema está correto
      const schema = `
        CREATE TABLE IF NOT EXISTS cronograma (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mes TEXT NOT NULL,
          atividade TEXT NOT NULL,
          categoria TEXT,
          inicio DATE,
          fim DATE
        );
      `;
      db.run(schema);
      return db;
    } catch (error) {
      // Schema não existe ou está corrompido, criar novo banco
      console.warn('Banco carregado do storage está corrompido ou sem schema, criando novo:', error);
      try {
        db.close();
      } catch (e) {
        // Ignorar erro ao fechar
      }
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // Executar schema SQL (sempre executar para garantir que existe)
  const schema = `
    CREATE TABLE IF NOT EXISTS cronograma (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mes TEXT NOT NULL,
      atividade TEXT NOT NULL,
      categoria TEXT,
      inicio DATE,
      fim DATE
    );
  `;

  db.run(schema);

  // Verificar se já existem dados
  const checkResult = db.exec('SELECT COUNT(*) as count FROM cronograma');
  const count = checkResult.length > 0 && checkResult[0].values.length > 0 
    ? checkResult[0].values[0][0] as number 
    : 0;

  // Inserir dados apenas se a tabela estiver vazia
  if (count === 0) {
    const insertData = `
      INSERT INTO cronograma (mes, atividade, categoria, inicio, fim) VALUES
      ('Janeiro', 'Levantamento de nomes dos embaixadores', 'Planejamento', '2025-01-01', '2025-01-31'),
      ('Fevereiro', 'Capacitação de Embaixadores', 'Capacitação', '2025-02-01', '2025-03-31'),
      ('Março', 'Capacitação de Embaixadores', 'Capacitação', '2025-02-01', '2025-03-31'),
      ('Fevereiro', 'Campanhas de ideias', 'Capacitação', '2025-02-01', '2025-04-30'),
      ('Março', 'Campanhas de ideias', 'Capacitação', '2025-02-01', '2025-04-30'),
      ('Abril', 'Campanhas de ideias', 'Capacitação', '2025-02-01', '2025-04-30'),
      ('Abril', 'Inova + Saúde', 'Inovação', '2025-04-01', '2025-05-31'),
      ('Maio', 'Inova + Saúde', 'Inovação', '2025-04-01', '2025-05-31'),
      ('Abril', 'Jornada da Inovação', 'Inovação', '2025-04-01', '2025-04-30'),
      ('Maio', 'Acelera', 'Inovação', '2025-05-01', '2025-05-31'),
      ('Junho', 'Impulsione', 'Inovação', '2025-06-01', '2025-07-31'),
      ('Julho', 'Impulsione', 'Inovação', '2025-06-01', '2025-07-31'),
      ('Junho', 'SW', 'Inovação', '2025-06-01', '2025-06-30'),
      ('Julho', 'Simpósio', 'Inovação', '2025-07-01', '2025-07-31'),
      ('Agosto', 'Piloto Impulsione', 'Projeto Piloto', '2025-08-01', '2025-10-31'),
      ('Setembro', 'Piloto Impulsione', 'Projeto Piloto', '2025-08-01', '2025-10-31'),
      ('Outubro', 'Piloto Impulsione', 'Projeto Piloto', '2025-08-01', '2025-10-31'),
      ('Novembro', 'Oscar da Inovação', 'Evento', '2025-11-01', '2025-11-30'),
      ('Dezembro', 'Anúncio da Inovação', 'Evento', '2025-12-01', '2025-12-31');
    `;
    db.run(insertData);
    saveDatabase(); // Salvar após inserir dados iniciais
  }

  return db;
}

export async function getAllCronogramaItems(): Promise<CronogramaItem[]> {
  const database = await initDatabase();
  const result = database.exec('SELECT * FROM cronograma ORDER BY inicio');
  
  if (!result.length) {
    return [];
  }

  const rows = result[0].values;
  const columns = result[0].columns;

  return rows.map((row) => {
    const item: any = {};
    columns.forEach((col, index) => {
      item[col] = row[index];
    });
    return item as CronogramaItem;
  });
}

export function getDatabase(): Database | null {
  return db;
}

export async function insertCronogramaItem(
  mes: string,
  atividade: string,
  categoria: string,
  inicio: string,
  fim: string
): Promise<number> {
  const database = await initDatabase();
  const stmt = database.prepare(
    'INSERT INTO cronograma (mes, atividade, categoria, inicio, fim) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run([mes, atividade, categoria, inicio, fim]);
  stmt.free();
  const id = database.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;
  
  // Salvar o banco SQLite completo após inserir
  saveDatabase();
  
  console.log(`➕ Item inserido no SQLite com ID: ${id}`);
  return id;
}

export async function updateCronogramaItem(
  id: number,
  mes: string,
  atividade: string,
  categoria: string,
  inicio: string,
  fim: string
): Promise<void> {
  const database = await initDatabase();
  const stmt = database.prepare(
    'UPDATE cronograma SET mes = ?, atividade = ?, categoria = ?, inicio = ?, fim = ? WHERE id = ?'
  );
  stmt.run([mes, atividade, categoria, inicio, fim, id]);
  stmt.free();
  
  // Salvar o banco SQLite completo após atualizar
  saveDatabase();
  
  console.log(`✏️ Item atualizado no SQLite com ID: ${id}`);
}

export async function deleteCronogramaItem(id: number): Promise<void> {
  const database = await initDatabase();
  const stmt = database.prepare('DELETE FROM cronograma WHERE id = ?');
  stmt.run([id]);
  stmt.free();
  
  // Salvar o banco SQLite completo após deletar
  saveDatabase();
  
  console.log(`🗑️ Item deletado do SQLite com ID: ${id}`);
}

