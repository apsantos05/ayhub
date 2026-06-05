import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { authRouter } from './routes/auth.routes.js';
import { crudRouter } from './routes/crud.routes.js';
import { getDatabaseStatus } from './db/database.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { usersRouter } from './routes/users.routes.js';

export const app = express();
const frontendDistPath = path.resolve(process.cwd(), '..', 'frontend', 'dist');

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, true);
  }
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'AY Hub' });
});

app.get('/api/db/status', (_req, res) => {
  res.json(getDatabaseStatus());
});

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/users', usersRouter);
app.use('/api', crudRouter);

app.use(express.static(frontendDistPath));

app.use('/assets', (req, res, next) => {
  if (!req.path.endsWith('.js') && !req.path.endsWith('.css')) {
    return next();
  }

  const files = fs.readdirSync(path.join(frontendDistPath, 'assets'));
  const currentFile = files.find((file) => file.endsWith(req.path.endsWith('.js') ? '.js' : '.css'));

  if (!currentFile) {
    return next();
  }

  return res.sendFile(path.join(frontendDistPath, 'assets', currentFile));
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  return res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Rota nao encontrada.' });
});
