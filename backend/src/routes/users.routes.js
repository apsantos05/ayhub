import { Router } from 'express';
import { hashPassword } from '../auth/password.js';
import { db } from '../db/database.js';

export const usersRouter = Router();

usersRouter.get('/', (_req, res) => {
  const users = db.prepare(`
    SELECT id, name, email, role, status, created_at
    FROM users
    ORDER BY created_at DESC
  `).all();
  res.json(users);
});

usersRouter.post('/', (req, res) => {
  const { name, email, password, role = 'funcionario', status = 'ativo' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, e-mail e senha sao obrigatorios.' });
  }

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) {
    return res.status(409).json({ message: 'Ja existe um usuario com este e-mail.' });
  }

  const result = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, status)
    VALUES (@name, @email, @password_hash, @role, @status)
  `).run({
    name,
    email,
    password_hash: hashPassword(password),
    role,
    status
  });

  res.status(201).json(getUser(result.lastInsertRowid));
});

usersRouter.put('/:id', (req, res) => {
  const { name, email, password, role = 'funcionario', status = 'ativo' } = req.body;
  const id = Number(req.params.id);

  if (!name || !email) {
    return res.status(400).json({ message: 'Nome e e-mail sao obrigatorios.' });
  }

  const duplicate = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, id);
  if (duplicate) {
    return res.status(409).json({ message: 'Ja existe outro usuario com este e-mail.' });
  }

  if (password) {
    db.prepare(`
      UPDATE users
      SET name = @name, email = @email, password_hash = @password_hash, role = @role, status = @status
      WHERE id = @id
    `).run({ id, name, email, password_hash: hashPassword(password), role, status });
  } else {
    db.prepare(`
      UPDATE users
      SET name = @name, email = @email, role = @role, status = @status
      WHERE id = @id
    `).run({ id, name, email, role, status });
  }

  res.json(getUser(id));
});

usersRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const totalAdmins = db.prepare("SELECT COUNT(*) as total FROM users WHERE role = 'admin' AND status = 'ativo'").get().total;
  const user = db.prepare('SELECT role, status FROM users WHERE id = ?').get(id);

  if (user?.role === 'admin' && user?.status === 'ativo' && totalAdmins <= 1) {
    return res.status(400).json({ message: 'Nao e possivel excluir o ultimo admin ativo.' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.status(204).send();
});

function getUser(id) {
  return db.prepare(`
    SELECT id, name, email, role, status, created_at
    FROM users
    WHERE id = ?
  `).get(id);
}
