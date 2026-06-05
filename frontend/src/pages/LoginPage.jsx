import React from 'react';
import { useState } from 'react';
import { Icon } from '../components/Icon.jsx';
import { api } from '../services/api.js';

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('arthurpsantos05@gmail.com');
  const [password, setPassword] = useState('ayhub123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const session = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      onLogin(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-brand">
          <div className="brand-mark">AY</div>
          <div>
            <strong>AY Hub</strong>
            <span>Painel da AY Social Media</span>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <h1>Entrar</h1>
            <p>Acesse seu painel de clientes, propostas, tarefas e financeiro.</p>
          </div>

          <label>
            E-mail
            <div className="input-group">
              <Icon name="mail" size={18} />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
          </label>

          <label>
            Senha
            <div className="input-group">
              <Icon name="lock" size={18} />
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar no AY Hub'}
          </button>
        </form>
      </section>
    </main>
  );
}
