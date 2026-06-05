import { Router } from 'express';
import { db } from '../db/database.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', (_req, res) => {
  const metrics = {
    totalClients: scalar('SELECT COUNT(*) FROM clients'),
    monthlyForecast: scalar("SELECT COALESCE(SUM(monthly_value), 0) FROM clients WHERE status = 'ativo'"),
    pendingPayments: scalar("SELECT COALESCE(SUM(value), 0) FROM financial_entries WHERE status = 'pendente' AND type = 'entrada'"),
    todayTasks: scalar("SELECT COUNT(*) FROM tasks WHERE due_date = date('now') AND status != 'concluida'"),
    upcomingContent: scalar("SELECT COUNT(*) FROM content_calendar WHERE date >= date('now') AND status != 'postado'"),
    openProposals: scalar("SELECT COUNT(*) FROM proposals WHERE status IN ('rascunho', 'enviada')")
  };

  const tasks = db.prepare(`
    SELECT id, title, priority, due_date, status
    FROM tasks
    WHERE status != 'concluida'
    ORDER BY due_date ASC, priority DESC
    LIMIT 5
  `).all();

  const content = db.prepare(`
    SELECT content_calendar.id, content_calendar.date, content_calendar.type, content_calendar.theme, content_calendar.status, clients.name as client_name
    FROM content_calendar
    LEFT JOIN clients ON clients.id = content_calendar.client_id
    WHERE content_calendar.status != 'postado'
    ORDER BY content_calendar.date ASC
    LIMIT 5
  `).all();

  const settings = db.prepare('SELECT agency_name, owner_name, proposal_email, primary_color FROM settings WHERE id = 1').get();

  res.json({ metrics, tasks, content, settings });
});

function scalar(sql) {
  const row = db.prepare(sql).get();
  return Object.values(row)[0] || 0;
}
