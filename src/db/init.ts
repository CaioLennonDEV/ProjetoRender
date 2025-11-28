import initSqlJs, { Database } from 'sql.js';
import { CronogramaItem } from './types';

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });

  db = new SQL.Database();

  // Executar schema SQL
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
  return database.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;
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
}

export async function deleteCronogramaItem(id: number): Promise<void> {
  const database = await initDatabase();
  const stmt = database.prepare('DELETE FROM cronograma WHERE id = ?');
  stmt.run([id]);
  stmt.free();
}

