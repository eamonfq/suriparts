import { Router } from 'express';
import db from '../models/db.js';

const router = Router();

// GET /api/rfqs
router.get('/', (req, res) => {
  const { status, supplier_id } = req.query;
  let where = ['1=1'];
  let params = [];

  if (status) {
    where.push('r.status = ?');
    params.push(status);
  }
  if (supplier_id) {
    where.push('r.supplier_id = ?');
    params.push(Number(supplier_id));
  }

  const sql = `
    SELECT r.*, s.name as supplier_name
    FROM rfqs r
    JOIN suppliers s ON r.supplier_id = s.id
    WHERE ${where.join(' AND ')}
    ORDER BY r.created_at DESC
  `;
  res.json(db.prepare(sql).all(...params));
});

// GET /api/rfqs/:id
router.get('/:id', (req, res) => {
  const rfq = db.prepare(`
    SELECT r.*, s.name as supplier_name, s.email as supplier_email, s.phone as supplier_phone
    FROM rfqs r
    JOIN suppliers s ON r.supplier_id = s.id
    WHERE r.id = ?
  `).get(req.params.id);

  if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
  res.json(rfq);
});

// POST /api/rfqs
router.post('/', (req, res) => {
  const { supplier_id, quote_id, part_number, description, quantity, urgency } = req.body;
  const result = db.prepare(`
    INSERT INTO rfqs (supplier_id, quote_id, part_number, description, quantity, urgency, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(supplier_id, quote_id || null, part_number, description, quantity || 1, urgency || 'normal');

  db.prepare(`INSERT INTO activity_log (entity_type, entity_id, action, description) VALUES ('rfq', ?, 'created', ?)`).run(result.lastInsertRowid, `RFQ created for ${part_number}`);

  res.status(201).json(db.prepare(`
    SELECT r.*, s.name as supplier_name
    FROM rfqs r JOIN suppliers s ON r.supplier_id = s.id
    WHERE r.id = ?
  `).get(result.lastInsertRowid));
});

// PUT /api/rfqs/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM rfqs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'RFQ not found' });

  const { status, response_price, response_notes } = req.body;
  db.prepare(`
    UPDATE rfqs SET status=?, response_price=?, response_notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
  `).run(
    status ?? existing.status,
    response_price ?? existing.response_price,
    response_notes ?? existing.response_notes,
    req.params.id
  );

  if (status && status !== existing.status) {
    db.prepare(`INSERT INTO activity_log (entity_type, entity_id, action, description) VALUES ('rfq', ?, 'status_change', ?)`).run(req.params.id, `RFQ status changed to ${status}`);
  }

  res.json(db.prepare(`
    SELECT r.*, s.name as supplier_name
    FROM rfqs r JOIN suppliers s ON r.supplier_id = s.id
    WHERE r.id = ?
  `).get(req.params.id));
});

export default router;
