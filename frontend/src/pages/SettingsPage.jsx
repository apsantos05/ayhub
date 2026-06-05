import React from 'react';
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { EntityForm } from '../components/EntityForm.jsx';

export function SettingsPage() {
  const [form, setForm] = useState(null);
  const [database, setDatabase] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api('/settings').then(setForm);
    api('/db/status').then(setDatabase);
  }, []);

  if (!form) return <div className="status-box">Carregando configuracoes...</div>;

  async function submit(event) {
    event.preventDefault();
    setForm(await api('/settings', { method: 'PUT', body: JSON.stringify(form) }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="page-stack">
      {saved && <div className="status-box success">Configuracoes salvas.</div>}
      {database && (
        <section className="panel">
          <div className="panel-header">
            <h2>Banco de dados</h2>
            <span>{database.connected ? 'Conectado' : 'Desconectado'}</span>
          </div>
          <div className="mini-grid">
            <div className="mini-card"><span>Motor</span><strong>{database.engine}</strong></div>
            <div className="mini-card"><span>Arquivo</span><strong>{database.fileExists ? 'Criado' : 'Nao criado'}</strong></div>
            <div className="mini-card"><span>Tamanho</span><strong>{database.sizeKb} KB</strong></div>
            <div className="mini-card"><span>Journal</span><strong>{database.journalMode}</strong></div>
          </div>
          <p className="path-text">{database.path}</p>
          <div className="table-wrap">
            <table className="data-table compact-table">
              <thead><tr><th>Tabela</th><th>Registros</th></tr></thead>
              <tbody>
                {database.tables.map((item) => (
                  <tr key={item.table}><td>{item.table}</td><td>{item.rows}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <EntityForm
        fields={[
          { name: 'agency_name', label: 'Nome da agencia' },
          { name: 'logo_url', label: 'Logo URL' },
          { name: 'primary_color', label: 'Cor principal', type: 'color' },
          { name: 'owner_name', label: 'Nome para propostas' },
          { name: 'proposal_email', label: 'E-mail para propostas', type: 'email' }
        ]}
        form={form}
        onCancel={() => {}}
        onChange={(field, value) => setForm({ ...form, [field]: value })}
        onSubmit={submit}
        submitLabel="Salvar configuracoes"
      />
    </div>
  );
}
