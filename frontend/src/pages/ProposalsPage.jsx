import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { DataTable } from '../components/DataTable.jsx';
import { EntityForm } from '../components/EntityForm.jsx';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function ProposalsPage() {
  const [rows, setRows] = useState([]);
  const [clients, setClients] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [form, setForm] = useState({ client_id: '', service: '', plan: '', value: '', deadline: '', notes: '', status: 'rascunho' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fields = useMemo(() => [
    { name: 'client_id', label: 'Cliente', type: 'select', options: clients.map((client) => ({ value: client.id, label: client.name })) },
    { name: 'service', label: 'Servico' },
    { name: 'plan', label: 'Plano' },
    { name: 'value', label: 'Valor', type: 'number' },
    { name: 'deadline', label: 'Prazo' },
    { name: 'status', label: 'Status', type: 'select', options: ['rascunho', 'enviada', 'aprovada', 'recusada'].map((value) => ({ value, label: value })) },
    { name: 'notes', label: 'Observacoes', type: 'textarea' }
  ], [clients]);

  useEffect(() => {
    load();
    api('/clients/options').then(setClients);
    api('/settings').then(setSettings);
  }, []);

  async function load() {
    setRows(await api('/proposals'));
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    await api(editingId ? `/proposals/${editingId}` : '/proposals', {
      method: editingId ? 'PUT' : 'POST',
      body: JSON.stringify(form)
    });
    reset();
    load();
  }

  function reset() {
    setForm({ client_id: '', service: '', plan: '', value: '', deadline: '', notes: '', status: 'rascunho' });
    setEditingId(null);
    setShowForm(false);
  }

  function whatsapp(row) {
    const text = [
      `Ola, ${row.client_name || 'tudo bem'}!`,
      `Segue a proposta da ${settings?.agency_name || 'AY Social Media'}:`,
      `Servico: ${row.service}`,
      `Plano: ${row.plan || '-'}`,
      `Investimento: ${money.format(row.value || 0)}`,
      `Prazo: ${row.deadline || '-'}`,
      row.notes ? `Observacoes: ${row.notes}` : '',
      `Arthur Pereira Antunes dos Santos - ${settings?.proposal_email || 'arthurpsantos05@gmail.com'}`
    ].filter(Boolean).join('\n');
    setSelectedText(text);
  }

  function printProposal(row) {
    const html = `
      <html><head><title>Proposta AY Social Media</title>
      <style>body{font-family:Arial;padding:40px;color:#172230}h1{color:#0f2a44}.box{border:1px solid #dbe3ec;padding:20px;margin:16px 0}</style>
      </head><body>
      <h1>Proposta Comercial</h1>
      <p><strong>${settings?.agency_name || 'AY Social Media'}</strong></p>
      <div class="box">
      <p><strong>Cliente:</strong> ${row.client_name || '-'}</p>
      <p><strong>Servico:</strong> ${row.service}</p>
      <p><strong>Plano:</strong> ${row.plan || '-'}</p>
      <p><strong>Valor:</strong> ${money.format(row.value || 0)}</p>
      <p><strong>Prazo:</strong> ${row.deadline || '-'}</p>
      <p><strong>Observacoes:</strong> ${row.notes || '-'}</p>
      </div>
      <p>${settings?.owner_name || 'Arthur Pereira Antunes dos Santos'}<br>${settings?.proposal_email || 'arthurpsantos05@gmail.com'}</p>
      <script>window.print()</script>
      </body></html>
    `;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  }

  async function remove(id) {
    if (!window.confirm('Excluir esta proposta?')) return;
    await api(`/proposals/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="page-stack">
      <div className="toolbar">
        <span className="empty-text">Crie propostas, gere texto para WhatsApp e imprima em PDF pelo navegador.</span>
        <button className="primary-button compact" onClick={() => setShowForm(true)} type="button">Nova proposta</button>
      </div>
      {showForm && <EntityForm fields={fields} form={form} onCancel={reset} onChange={update} onSubmit={submit} submitLabel={editingId ? 'Salvar' : 'Criar proposta'} />}
      {selectedText && (
        <div className="panel">
          <div className="panel-header"><h2>Texto para WhatsApp</h2><button onClick={() => navigator.clipboard.writeText(selectedText)}>Copiar</button></div>
          <pre className="text-preview">{selectedText}</pre>
        </div>
      )}
      <DataTable
        columns={[
          { key: 'client_name', label: 'Cliente' },
          { key: 'service', label: 'Servico' },
          { key: 'plan', label: 'Plano' },
          { key: 'value', label: 'Valor', render: (row) => money.format(row.value || 0) },
          { key: 'status', label: 'Status' }
        ]}
        rows={rows}
        actions={(row) => (
          <>
            <button onClick={() => whatsapp(row)}>WhatsApp</button>
            <button onClick={() => printProposal(row)}>PDF</button>
            <button onClick={() => { setForm({ ...form, ...row }); setEditingId(row.id); setShowForm(true); }}>Editar</button>
            <button onClick={() => remove(row.id)}>Excluir</button>
          </>
        )}
      />
    </div>
  );
}
