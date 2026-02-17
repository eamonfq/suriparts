import { Router } from 'express';
import db from '../models/db.js';

const router = Router();

// GET /api/clients
router.get('/', (req, res) => {
  const { search } = req.query;
  let sql = 'SELECT * FROM clients';
  let params = [];
  if (search) {
    sql += ' WHERE name LIKE ? OR company LIKE ? OR email LIKE ? OR country LIKE ?';
    const s = `%${search}%`;
    params = [s, s, s, s];
  }
  sql += ' ORDER BY company ASC';
  const clients = db.prepare(sql).all(...params);
  res.json(clients);
});

// GET /api/clients/:id
router.get('/:id', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const quotes = db.prepare('SELECT * FROM quotes WHERE client_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ ...client, quotes });
});

// POST /api/clients
router.post('/', (req, res) => {
  const { name, company, country, email, phone, whatsapp, notes } = req.body;
  const result = db.prepare(`
    INSERT INTO clients (name, company, country, email, phone, whatsapp, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, company, country, email, phone, whatsapp, notes);

  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(client);
});

// PUT /api/clients/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Client not found' });

  const { name, company, country, email, phone, whatsapp, notes } = req.body;
  db.prepare(`
    UPDATE clients SET name=?, company=?, country=?, email=?, phone=?, whatsapp=?, notes=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    name ?? existing.name, company ?? existing.company, country ?? existing.country,
    email ?? existing.email, phone ?? existing.phone, whatsapp ?? existing.whatsapp,
    notes ?? existing.notes, req.params.id
  );

  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  res.json(client);
});

// DELETE /api/clients/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Client not found' });
  res.json({ success: true });
});

export default router;
