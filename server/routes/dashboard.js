import { Router } from 'express';
import db from '../models/db.js';

const router = Router();

// GET /api/dashboard
router.get('/', (req, res) => {
  const pendingQuotes = db.prepare("SELECT COUNT(*) as count FROM quotes WHERE status IN ('draft', 'sent')").get();
  const monthQuotes = db.prepare("SELECT COUNT(*) as count FROM quotes WHERE created_at >= date('now', 'start of month')").get();
  const acceptedThisMonth = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM quotes WHERE status = 'accepted' AND created_at >= date('now', 'start of month')").get();
  const totalParts = db.prepare("SELECT COUNT(*) as count, SUM(quantity) as total_qty FROM parts").get();
  const pendingRFQs = db.prepare("SELECT COUNT(*) as count FROM rfqs WHERE status = 'pending'").get();

  const topParts = db.prepare(`
    SELECT qi.part_number, qi.description, COUNT(*) as times_quoted, SUM(qi.quantity) as total_qty
    FROM quote_items qi
    GROUP BY qi.part_number
    ORDER BY times_quoted DESC
    LIMIT 5
  `).all();

  const recentActivity = db.prepare(`
    SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10
  `).all();

  const unansweredQuotes = db.prepare(`
    SELECT q.*, c.company as client_company, c.name as client_name
    FROM quotes q
    JOIN clients c ON q.client_id = c.id
    WHERE q.status = 'draft'
    ORDER BY q.created_at ASC
    LIMIT 5
  `).all();

  const quotesByStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM quotes GROUP BY status
  `).all();

  res.json({
    pending_quotes: pendingQuotes.count,
    quotes_this_month: monthQuotes.count,
    accepted_this_month: acceptedThisMonth.count,
    monthly_revenue: acceptedThisMonth.revenue,
    total_parts: totalParts.count,
    total_inventory: totalParts.total_qty,
    pending_rfqs: pendingRFQs.count,
    top_parts: topParts,
    recent_activity: recentActivity,
    unanswered_quotes: unansweredQuotes,
    quotes_by_status: quotesByStatus
  });
});

export default router;
