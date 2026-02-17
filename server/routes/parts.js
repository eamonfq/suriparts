import { Router } from 'express';
import db from '../models/db.js';

const router = Router();

// GET /api/parts - List/search parts
router.get('/', (req, res) => {
  const { search, condition, location, min_price, max_price, category, page = 1, limit = 50 } = req.query;

  let where = ['1=1'];
  let params = [];

  if (search) {
    where.push('(p.part_number LIKE ? OR p.description LIKE ? OR p.aircraft_type LIKE ? OR p.serial_number LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (condition) {
    where.push('p.condition = ?');
    params.push(condition);
  }
  if (location) {
    where.push('p.location = ?');
    params.push(location);
  }
  if (min_price) {
    where.push('p.price >= ?');
    params.push(Number(min_price));
  }
  if (max_price) {
    where.push('p.price <= ?');
    params.push(Number(max_price));
  }
  if (category) {
    where.push('p.category = ?');
    params.push(category);
  }

  const offset = (Number(page) - 1) * Number(limit);
  const whereClause = where.join(' AND ');

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM parts p WHERE ${whereClause}`).get(...params);
  const parts = db.prepare(`SELECT * FROM parts p WHERE ${whereClause} ORDER BY p.updated_at DESC LIMIT ? OFFSET ?`).all(...params, Number(limit), offset);

  res.json({
    parts,
    total: countRow.total,
    page: Number(page),
    totalPages: Math.ceil(countRow.total / Number(limit))
  });
});

// GET /api/parts/categories - Get distinct categories
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT DISTINCT category FROM parts WHERE category IS NOT NULL ORDER BY category').all();
  res.json(categories.map(c => c.category));
});

// GET /api/parts/:id - Get single part
router.get('/:id', (req, res) => {
  const part = db.prepare('SELECT * FROM parts WHERE id = ?').get(req.params.id);
  if (!part) return res.status(404).json({ error: 'Part not found' });
  res.json(part);
});

// POST /api/parts - Create part
router.post('/', (req, res) => {
  const { part_number, description, condition, serial_number, quantity, location, price, certification, aircraft_type, category, notes } = req.body;
  const result = db.prepare(`
    INSERT INTO parts (part_number, description, condition, serial_number, quantity, location, price, certification, aircraft_type, category, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(part_number, description, condition, serial_number, quantity || 0, location, price || 0, certification, aircraft_type, category, notes);

  const part = db.prepare('SELECT * FROM parts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(part);
});

// PUT /api/parts/:id - Update part
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM parts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Part not found' });

  const fields = ['part_number', 'description', 'condition', 'serial_number', 'quantity', 'location', 'price', 'certification', 'aircraft_type', 'category', 'notes'];
  const updates = {};
  for (const f of fields) {
    updates[f] = req.body[f] !== undefined ? req.body[f] : existing[f];
  }

  db.prepare(`
    UPDATE parts SET part_number=?, description=?, condition=?, serial_number=?, quantity=?, location=?, price=?, certification=?, aircraft_type=?, category=?, notes=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(updates.part_number, updates.description, updates.condition, updates.serial_number, updates.quantity, updates.location, updates.price, updates.certification, updates.aircraft_type, updates.category, updates.notes, req.params.id);

  const part = db.prepare('SELECT * FROM parts WHERE id = ?').get(req.params.id);
  res.json(part);
});

// DELETE /api/parts/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM parts WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Part not found' });
  res.json({ success: true });
});

export default router;
