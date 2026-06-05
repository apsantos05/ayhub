import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from '../auth/password.js';

const dataDir = path.resolve(process.env.DATABASE_DIR || path.join(process.cwd(), 'data'));
fs.mkdirSync(dataDir, { recursive: true });

export const databasePath = path.resolve(process.env.DATABASE_PATH || path.join(dataDir, 'ayhub.db'));
export const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const trackedTables = [
  'clients',
  'proposals',
  'financial_entries',
  'content_calendar',
  'tasks',
  'studies',
  'settings',
  'users'
];

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT,
      niche TEXT,
      phone TEXT,
      instagram TEXT,
      email TEXT,
      plan TEXT,
      monthly_value REAL DEFAULT 0,
      due_date TEXT,
      status TEXT DEFAULT 'ativo',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      service TEXT NOT NULL,
      plan TEXT,
      value REAL DEFAULT 0,
      deadline TEXT,
      notes TEXT,
      status TEXT DEFAULT 'rascunho',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    CREATE TABLE IF NOT EXISTS financial_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      value REAL NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'pendente',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    CREATE TABLE IF NOT EXISTS content_calendar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      theme TEXT NOT NULL,
      caption TEXT,
      status TEXT DEFAULT 'ideia',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'media',
      due_date TEXT,
      status TEXT DEFAULT 'pendente',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS studies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theme TEXT NOT NULL,
      platform TEXT,
      studied_minutes INTEGER DEFAULT 0,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      agency_name TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      proposal_email TEXT NOT NULL,
      logo_url TEXT,
      primary_color TEXT DEFAULT '#0f2a44'
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'funcionario',
      status TEXT DEFAULT 'ativo',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const settings = db.prepare('SELECT id FROM settings WHERE id = 1').get();
  if (!settings) {
    db.prepare(`
      INSERT INTO settings (id, agency_name, owner_name, proposal_email, primary_color)
      VALUES (1, 'AY Social Media', 'Arthur Pereira Antunes dos Santos', 'arthurpsantos05@gmail.com', '#0f2a44')
    `).run();
  }

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(process.env.AUTH_EMAIL || 'arthurpsantos05@gmail.com');
  if (!user) {
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (@name, @email, @password_hash, @role, 'ativo')
    `).run({
      name: 'Arthur Pereira',
      email: process.env.AUTH_EMAIL || 'arthurpsantos05@gmail.com',
      password_hash: hashPassword(process.env.AUTH_PASSWORD || 'ayhub123'),
      role: 'admin'
    });
  }

  const clientCount = db.prepare('SELECT COUNT(*) as total FROM clients').get().total;
  if (clientCount === 0) {
    seedInitialData();
  }
}

function seedInitialData() {
  const insertClient = db.prepare(`
    INSERT INTO clients (name, company, niche, phone, instagram, email, plan, monthly_value, due_date, status, notes)
    VALUES (@name, @company, @niche, @phone, @instagram, @email, @plan, @monthly_value, @due_date, @status, @notes)
  `);

  const clients = [
    {
      name: 'Cliente Exemplo',
      company: 'Marca Local',
      niche: 'Estetica',
      phone: '(00) 90000-0000',
      instagram: '@marca.local',
      email: 'contato@marcalocal.com',
      plan: 'Social Essencial',
      monthly_value: 1200,
      due_date: '2026-06-10',
      status: 'ativo',
      notes: 'Cliente de exemplo para visualizar o dashboard.'
    },
    {
      name: 'Lead em Negociacao',
      company: 'Studio Criativo',
      niche: 'Arquitetura',
      phone: '(00) 98888-0000',
      instagram: '@studiocriativo',
      email: 'hello@studio.com',
      plan: 'Conteudo Pro',
      monthly_value: 1800,
      due_date: '2026-06-20',
      status: 'pendente',
      notes: 'Aguardando aprovacao.'
    }
  ];

  const ids = clients.map((client) => insertClient.run(client).lastInsertRowid);

  db.prepare(`
    INSERT INTO proposals (client_id, service, plan, value, deadline, notes, status)
    VALUES (?, 'Gestao de redes sociais', 'Conteudo Pro', 1800, '7 dias', 'Proposta enviada pelo WhatsApp.', 'enviada')
  `).run(ids[1]);

  db.prepare(`
    INSERT INTO financial_entries (client_id, type, description, value, date, status)
    VALUES (?, 'entrada', 'Mensalidade Social Essencial', 1200, '2026-06-10', 'pendente')
  `).run(ids[0]);

  db.prepare(`
    INSERT INTO content_calendar (client_id, date, type, theme, caption, status)
    VALUES (?, '2026-06-06', 'reels', 'Bastidores do atendimento', 'Mostrar processo e prova social.', 'em produção')
  `).run(ids[0]);

  db.prepare(`
    INSERT INTO tasks (title, description, priority, due_date, status)
    VALUES ('Revisar calendario da semana', 'Conferir conteudos pendentes dos clientes ativos.', 'alta', '2026-06-05', 'pendente')
  `).run();

  db.prepare(`
    INSERT INTO studies (theme, platform, studied_minutes, date, notes)
    VALUES ('React', 'Curso online', 45, '2026-06-03', 'Componentes e estado.')
  `).run();
}

export function getDatabaseStatus() {
  const fileExists = fs.existsSync(databasePath);
  const stats = fileExists ? fs.statSync(databasePath) : null;
  const journalMode = db.pragma('journal_mode', { simple: true });
  const tables = trackedTables.map((table) => ({
    table,
    rows: db.prepare(`SELECT COUNT(*) as total FROM ${table}`).get().total
  }));

  return {
    connected: true,
    engine: 'SQLite',
    path: databasePath,
    fileExists,
    sizeKb: stats ? Number((stats.size / 1024).toFixed(1)) : 0,
    journalMode,
    tables
  };
}
