import { Router } from 'express';
import { verifyPassword } from '../auth/password.js';
import { db } from '../db/database.js';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare(`
    SELECT id, name, email, password_hash, role, status
    FROM users
    WHERE email = ?
  `).get(email);

  if (user?.status === 'ativo' && verifyPassword(password, user.password_hash)) {
    return res.json({
      token: Buffer.from(`${email}:${Date.now()}`).toString('base64'),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }

  return res.status(401).json({ message: 'E-mail ou senha invalidos.' });
});
