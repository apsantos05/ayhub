import { Router } from 'express';
import { db } from '../db/database.js';

export const crudRouter = Router();

const resources = {
  clients: {
    table: 'clients',
    fields: ['name', 'company', 'niche', 'phone', 'instagram', 'email', 'plan', 'monthly_value', 'due_date', 'status', 'notes'],
    required: ['name'],
    order: 'created_at DESC'
  },
  proposals: {
    table: 'proposals',
    fields: ['client_id', 'service', 'plan', 'value', 'deadline', 'notes', 'status'],
    required: ['service'],
    order: 'created_at DESC'
  },
  financial: {
    table: 'financial_entries',
    fields: ['client_id', 'type', 'description', 'value', 'date', 'status'],
    required: ['type', 'description', 'value', 'date'],
    order: 'date DESC'
  },
  content: {
    table: 'content_calendar',
    fields: ['client_id', 'date', 'type', 'theme', 'caption', 'status'],
    required: ['date', 'type', 'theme'],
    order: 'date ASC'
  },
  tasks: {
    table: 'tasks',
    fields: ['title', 'description', 'priority', 'due_date', 'status'],
    required: ['title'],
    order: 'due_date ASC, created_at DESC'
  },
  studies: {
    table: 'studies',
    fields: ['theme', 'platform', 'studied_minutes', 'date', 'notes'],
    required: ['theme', 'date'],
    order: 'date DESC'
  }
};

crudRouter.get('/clients/options', (_req, res) => {
  const clients = db.prepare('SELECT id, name, company, status FROM clients ORDER BY name ASC').all();
  res.json(clients);
});

crudRouter.get('/settings', (_req, res) => {
  res.json(db.prepare('SELECT * FROM settings WHERE id = 1').get());
});

crudRouter.put('/settings', (req, res) => {
  const data = pick(req.body, ['agency_name', 'owner_name', 'proposal_email', 'logo_url', 'primary_color']);
  db.prepare(`
    UPDATE settings
    SET agency_name = @agency_name,
        owner_name = @owner_name,
        proposal_email = @proposal_email,
        logo_url = @logo_url,
        primary_color = @primary_color
    WHERE id = 1
  `).run({
    agency_name: data.agency_name || 'AY Social Media',
    owner_name: data.owner_name || 'Arthur Pereira Antunes dos Santos',
    proposal_email: data.proposal_email || 'arthurpsantos05@gmail.com',
    logo_url: data.logo_url || '',
    primary_color: data.primary_color || '#0f2a44'
  });

  res.json(db.prepare('SELECT * FROM settings WHERE id = 1').get());
});

crudRouter.get('/summary/financial', (_req, res) => {
  const income = scalar("SELECT COALESCE(SUM(value), 0) FROM financial_entries WHERE type = 'entrada' AND status = 'pago'");
  const expenses = scalar("SELECT COALESCE(SUM(value), 0) FROM financial_entries WHERE type = 'saida' AND status = 'pago'");
  const pending = scalar("SELECT COALESCE(SUM(value), 0) FROM financial_entries WHERE status = 'pendente'");
  const lateClients = db.prepare(`
    SELECT id, name, company, due_date, monthly_value
    FROM clients
    WHERE status = 'ativo' AND due_date < date('now')
    ORDER BY due_date ASC
  `).all();

  res.json({ income, expenses, profit: income - expenses, pending, lateClients });
});

crudRouter.get('/summary/studies', (_req, res) => {
  const weekMinutes = scalar("SELECT COALESCE(SUM(studied_minutes), 0) FROM studies WHERE date >= date('now', '-7 days')");
  const byTheme = db.prepare(`
    SELECT theme, COALESCE(SUM(studied_minutes), 0) as minutes
    FROM studies
    GROUP BY theme
    ORDER BY minutes DESC
  `).all();

  res.json({ weekMinutes, byTheme });
});

crudRouter.get('/:resource', (req, res) => {
  const config = getResource(req.params.resource, res);
  if (!config) return;

  const rows = listRows(config, req.query);
  res.json(rows);
});

crudRouter.post('/:resource', (req, res) => {
  const config = getResource(req.params.resource, res);
  if (!config) return;
  const error = validate(config, req.body);
  if (error) return res.status(400).json({ message: error });

  const data = pick(req.body, config.fields);
  const placeholders = config.fields.map((field) => `@${field}`).join(', ');
  const result = db.prepare(`
    INSERT INTO ${config.table} (${config.fields.join(', ')})
    VALUES (${placeholders})
  `).run(data);

  res.status(201).json(getById(config, result.lastInsertRowid));
});

crudRouter.put('/:resource/:id', (req, res) => {
  const config = getResource(req.params.resource, res);
  if (!config) return;
  const error = validate(config, req.body);
  if (error) return res.status(400).json({ message: error });

  const data = pick(req.body, config.fields);
  data.id = Number(req.params.id);
  const assignments = config.fields.map((field) => `${field} = @${field}`).join(', ');
  db.prepare(`UPDATE ${config.table} SET ${assignments} WHERE id = @id`).run(data);
  res.json(getById(config, data.id));
});

crudRouter.delete('/:resource/:id', (req, res) => {
  const config = getResource(req.params.resource, res);
  if (!config) return;

  db.prepare(`DELETE FROM ${config.table} WHERE id = ?`).run(Number(req.params.id));
  res.status(204).send();
});

function listRows(config, query) {
  const clauses = [];
  const params = {};

  if (query.status) {
    clauses.push('status = @status');
    params.status = query.status;
  }

  if (query.client_id) {
    clauses.push('client_id = @client_id');
    params.client_id = Number(query.client_id);
  }

  if (query.search && config.table === 'clients') {
    clauses.push('(name LIKE @search OR company LIKE @search OR niche LIKE @search OR email LIKE @search)');
    params.search = `%${query.search}%`;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const joins = ['proposals', 'financial_entries', 'content_calendar'].includes(config.table)
    ? `LEFT JOIN clients ON clients.id = ${config.table}.client_id`
    : '';
  const select = joins
    ? `${config.table}.*, clients.name as client_name`
    : `${config.table}.*`;

  return db.prepare(`
    SELECT ${select}
    FROM ${config.table}
    ${joins}
    ${where}
    ORDER BY ${config.order}
  `).all(params);
}

function getResource(resource, res) {
  const config = resources[resource];
  if (!config) {
    res.status(404).json({ message: 'Modulo nao encontrado.' });
    return null;
  }

  return config;
}

function getById(config, id) {
  return db.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).get(id);
}

function pick(source, fields) {
  return fields.reduce((data, field) => {
    data[field] = source[field] ?? null;
    return data;
  }, {});
}

function validate(config, body) {
  const missing = config.required.find((field) => body[field] === undefined || body[field] === null || body[field] === '');
  return missing ? `Campo obrigatorio: ${missing}` : '';
}

function scalar(sql) {
  const row = db.prepare(sql).get();
  return Object.values(row)[0] || 0;
}
