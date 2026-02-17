import { Router } from 'express';
import db from '../models/db.js';

const router = Router();

// GET /api/quotes
router.get('/', (req, res) => {
  const { status, client_id, search } = req.query;
  let where = ['1=1'];
  let params = [];

  if (status) {
    where.push('q.status = ?');
    params.push(status);
  }
  if (client_id) {
    where.push('q.client_id = ?');
    params.push(Number(client_id));
  }
  if (search) {
    where.push('(q.quote_number LIKE ? OR c.company LIKE ? OR c.name LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const sql = `
    SELECT q.*, c.name as client_name, c.company as client_company, c.email as client_email
    FROM quotes q
    JOIN clients c ON q.client_id = c.id
    WHERE ${where.join(' AND ')}
    ORDER BY q.created_at DESC
  `;
  const quotes = db.prepare(sql).all(...params);
  res.json(quotes);
});

// GET /api/quotes/stats
router.get('/stats', (req, res) => {
  const pending = db.prepare("SELECT COUNT(*) as count FROM quotes WHERE status IN ('draft', 'sent')").get();
  const thisMonth = db.prepare("SELECT COUNT(*) as count FROM quotes WHERE created_at >= date('now', 'start of month')").get();
  const accepted = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM quotes WHERE status = 'accepted'").get();
  const topParts = db.prepare(`
    SELECT qi.part_number, qi.description, COUNT(*) as times_quoted, SUM(qi.quantity) as total_qty
    FROM quote_items qi
    GROUP BY qi.part_number
    ORDER BY times_quoted DESC
    LIMIT 5
  `).all();

  res.json({
    pending_quotes: pending.count,
    quotes_this_month: thisMonth.count,
    accepted_total: accepted.total,
    accepted_count: accepted.count,
    top_parts: topParts
  });
});

// GET /api/quotes/:id
router.get('/:id', (req, res) => {
  const quote = db.prepare(`
    SELECT q.*, c.name as client_name, c.company as client_company, c.email as client_email,
    c.phone as client_phone, c.whatsapp as client_whatsapp, c.country as client_country
    FROM quotes q
    JOIN clients c ON q.client_id = c.id
    WHERE q.id = ?
  `).get(req.params.id);

  if (!quote) return res.status(404).json({ error: 'Quote not found' });

  const items = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?').all(req.params.id);
  res.json({ ...quote, items });
});

// POST /api/quotes
router.post('/', (req, res) => {
  const { client_id, notes, valid_until, items = [] } = req.body;

  // Generate quote number
  const last = db.prepare("SELECT quote_number FROM quotes ORDER BY id DESC LIMIT 1").get();
  let nextNum = 1;
  if (last) {
    const match = last.quote_number.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  const quote_number = `QT-2026-${String(nextNum).padStart(3, '0')}`;

  let subtotal = 0;
  for (const item of items) {
    subtotal += (item.quantity || 1) * (item.unit_price || 0);
  }

  const result = db.prepare(`
    INSERT INTO quotes (quote_number, client_id, status, subtotal, tax, total, notes, valid_until)
    VALUES (?, ?, 'draft', ?, 0, ?, ?, ?)
  `).run(quote_number, client_id, subtotal, subtotal, notes, valid_until);

  const quoteId = result.lastInsertRowid;

  const insertItem = db.prepare(`
    INSERT INTO quote_items (quote_id, part_id, part_number, description, condition, quantity, unit_price, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of items) {
    const totalPrice = (item.quantity || 1) * (item.unit_price || 0);
    insertItem.run(quoteId, item.part_id || null, item.part_number, item.description, item.condition, item.quantity || 1, item.unit_price || 0, totalPrice);
  }

  // Log activity
  db.prepare(`INSERT INTO activity_log (entity_type, entity_id, action, description) VALUES ('quote', ?, 'created', ?)`).run(quoteId, `Quote ${quote_number} created`);

  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(quoteId);
  const quoteItems = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?').all(quoteId);
  res.status(201).json({ ...quote, items: quoteItems });
});

// PUT /api/quotes/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Quote not found' });

  const { client_id, status, notes, valid_until, items } = req.body;

  if (items !== undefined) {
    // Recalculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += (item.quantity || 1) * (item.unit_price || 0);
    }

    db.prepare('DELETE FROM quote_items WHERE quote_id = ?').run(req.params.id);

    const insertItem = db.prepare(`
      INSERT INTO quote_items (quote_id, part_id, part_number, description, condition, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      const totalPrice = (item.quantity || 1) * (item.unit_price || 0);
      insertItem.run(req.params.id, item.part_id || null, item.part_number, item.description, item.condition, item.quantity || 1, item.unit_price || 0, totalPrice);
    }

    db.prepare(`
      UPDATE quotes SET client_id=?, status=?, subtotal=?, total=?, notes=?, valid_until=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `).run(
      client_id ?? existing.client_id,
      status ?? existing.status,
      subtotal, subtotal,
      notes ?? existing.notes,
      valid_until ?? existing.valid_until,
      req.params.id
    );
  } else {
    db.prepare(`
      UPDATE quotes SET client_id=?, status=?, notes=?, valid_until=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `).run(
      client_id ?? existing.client_id,
      status ?? existing.status,
      notes ?? existing.notes,
      valid_until ?? existing.valid_until,
      req.params.id
    );
  }

  if (status && status !== existing.status) {
    db.prepare(`INSERT INTO activity_log (entity_type, entity_id, action, description) VALUES ('quote', ?, 'status_change', ?)`).run(req.params.id, `Quote ${existing.quote_number} changed to ${status}`);
  }

  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  const quoteItems = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?').all(req.params.id);
  res.json({ ...quote, items: quoteItems });
});

// POST /api/quotes/:id/duplicate
router.post('/:id/duplicate', (req, res) => {
  const original = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  if (!original) return res.status(404).json({ error: 'Quote not found' });

  const items = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?').all(req.params.id);

  const last = db.prepare("SELECT quote_number FROM quotes ORDER BY id DESC LIMIT 1").get();
  let nextNum = 1;
  if (last) {
    const match = last.quote_number.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  const quote_number = `QT-2026-${String(nextNum).padStart(3, '0')}`;

  const result = db.prepare(`
    INSERT INTO quotes (quote_number, client_id, status, subtotal, tax, total, notes, valid_until)
    VALUES (?, ?, 'draft', ?, ?, ?, ?, date('now', '+30 days'))
  `).run(quote_number, original.client_id, original.subtotal, original.tax, original.total, `Duplicated from ${original.quote_number}. ${original.notes || ''}`);

  const newId = result.lastInsertRowid;
  const insertItem = db.prepare(`
    INSERT INTO quote_items (quote_id, part_id, part_number, description, condition, quantity, unit_price, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of items) {
    insertItem.run(newId, item.part_id, item.part_number, item.description, item.condition, item.quantity, item.unit_price, item.total_price);
  }

  db.prepare(`INSERT INTO activity_log (entity_type, entity_id, action, description) VALUES ('quote', ?, 'created', ?)`).run(newId, `Quote ${quote_number} duplicated from ${original.quote_number}`);

  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(newId);
  const newItems = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?').all(newId);
  res.status(201).json({ ...quote, items: newItems });
});

// DELETE /api/quotes/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM quote_items WHERE quote_id = ?').run(req.params.id);
  const result = db.prepare('DELETE FROM quotes WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Quote not found' });
  res.json({ success: true });
});

export default router;
