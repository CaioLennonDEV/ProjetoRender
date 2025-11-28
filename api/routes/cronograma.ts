import { Router, Request, Response } from 'express';
import pool from '../db.js';
import { CronogramaItem } from '../../src/db/types.js';

const router = Router();

// GET /api/cronograma - Listar todos os eventos
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, mes, atividade, categoria, inicio::text, fim::text FROM cronograma ORDER BY inicio ASC'
    );
    
    // Garantir que as datas estão no formato YYYY-MM-DD
    const items = result.rows.map((row: any) => ({
      ...row,
      inicio: row.inicio ? row.inicio.split('T')[0] : null,
      fim: row.fim ? row.fim.split('T')[0] : null,
    }));
    
    console.log(`✅ Retornando ${items.length} eventos do banco`);
    res.json(items);
  } catch (error: any) {
    console.error('❌ Erro ao buscar cronograma:', error);
    console.error('Detalhes:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Erro ao buscar cronograma',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/cronograma - Criar novo evento
router.post('/', async (req: Request, res: Response) => {
  try {
    const { mes, atividade, categoria, inicio, fim } = req.body;

    if (!mes || !atividade || !categoria || !inicio || !fim) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const result = await pool.query(
      `INSERT INTO cronograma (mes, atividade, categoria, inicio, fim) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, mes, atividade, categoria, inicio::text, fim::text`,
      [mes, atividade, categoria, inicio, fim]
    );

    const item = result.rows[0];
    // Garantir formato de data correto
    item.inicio = item.inicio ? item.inicio.split('T')[0] : null;
    item.fim = item.fim ? item.fim.split('T')[0] : null;
    
    res.status(201).json(item);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

// PUT /api/cronograma/:id - Atualizar evento
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mes, atividade, categoria, inicio, fim } = req.body;

    if (!mes || !atividade || !categoria || !inicio || !fim) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const result = await pool.query(
      `UPDATE cronograma 
       SET mes = $1, atividade = $2, categoria = $3, inicio = $4, fim = $5 
       WHERE id = $6 
       RETURNING id, mes, atividade, categoria, inicio::text, fim::text`,
      [mes, atividade, categoria, inicio, fim, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    const item = result.rows[0];
    // Garantir formato de data correto
    item.inicio = item.inicio ? item.inicio.split('T')[0] : null;
    item.fim = item.fim ? item.fim.split('T')[0] : null;

    res.json(item);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
});

// DELETE /api/cronograma/:id - Deletar evento
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM cronograma WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    res.status(500).json({ error: 'Erro ao deletar evento' });
  }
});

export default router;

