import { Router } from 'express';
import db from '../models/db.js';

const router = Router();

// GET /api/suppliers
router.get('/', (req, res) => {
  const { search } = req.query;
  let sql = 'SELECT * FROM suppliers';
  let params = [];
  if (search) {
    sql += ' WHERE name LIKE ? OR specialty LIKE ? OR contact_name LIKE ?';
    const s = `%${search}%`;
    params = [s, s, s];
  }
  sql += ' ORDER BY name ASC';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/suppliers/:id
router.get('/:id', (req, res) => {
  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

  const rfqs = db.prepare('SELECT * FROM rfqs WHERE supplier_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ ...supplier, rfqs });
});

// POST /api/suppliers
router.post('/', (req, res) => {
  const { name, contact_name, email, phone, country, specialty, notes } = req.body;
  const result = db.prepare(`
    INSERT INTO suppliers (name, contact_name, email, phone, country, specialty, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, contact_name, email, phone, country, specialty, notes);

  res.status(201).json(db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid));
});

// PUT /api/suppliers/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Supplier not found' });

  const { name, contact_name, email, phone, country, specialty, notes } = req.body;
  db.prepare(`
    UPDATE suppliers SET name=?, contact_name=?, email=?, phone=?, country=?, specialty=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
  `).run(
    name ?? existing.name, contact_name ?? existing.contact_name, email ?? existing.email,
    phone ?? existing.phone, country ?? existing.country, specialty ?? existing.specialty,
    notes ?? existing.notes, req.params.id
  );

  res.json(db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id));
});

export default router;
