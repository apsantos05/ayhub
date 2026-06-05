import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { DataTable } from '../components/DataTable.jsx';
import { EntityForm } from '../components/EntityForm.jsx';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const statusOptions = {
  client: ['ativo', 'pendente', 'encerrado'],
  proposal: ['rascunho', 'enviada', 'aprovada', 'recusada'],
  payment: ['pago', 'pendente'],
  content: ['ideia', 'em producao', 'aprovado', 'postado'],
  task: ['pendente', 'fazendo', 'concluida']
};

export const modules = {
  Clientes: {
    endpoint: '/clients',
    empty: { name: '', company: '', niche: '', phone: '', instagram: '', email: '', plan: '', monthly_value: '', due_date: '', status: 'ativo', notes: '' },
    fields: [
      ['name', 'Nome do cliente'], ['company', 'Empresa'], ['niche', 'Nicho'], ['phone', 'Telefone/WhatsApp'],
      ['instagram', 'Instagram'], ['email', 'E-mail', 'email'], ['plan', 'Plano contratado'], ['monthly_value', 'Valor mensal', 'number'],
      ['due_date', 'Data de vencimento', 'date'], ['status', 'Status', 'select', statusOptions.client], ['notes', 'Observacoes', 'textarea']
    ],
    columns: [
      ['name', 'Cliente'], ['company', 'Empresa'], ['niche', 'Nicho'], ['plan', 'Plano'], ['monthly_value', 'Mensalidade', (row) => money.format(row.monthly_value || 0)], ['status', 'Status']
    ],
    filters: true
  },
  Financeiro: {
    endpoint: '/financial',
    empty: { client_id: '', type: 'entrada', description: '', value: '', date: new Date().toISOString().slice(0, 10), status: 'pendente' },
    fields: [
      ['client_id', 'Cliente', 'client'], ['type', 'Tipo', 'select', ['entrada', 'saida']], ['description', 'Descricao'],
      ['value', 'Valor', 'number'], ['date', 'Data', 'date'], ['status', 'Status', 'select', statusOptions.payment]
    ],
    columns: [
      ['client_name', 'Cliente'], ['type', 'Tipo'], ['description', 'Descricao'], ['value', 'Valor', (row) => money.format(row.value || 0)], ['date', 'Data'], ['status', 'Status']
    ],
    summary: 'financial'
  },
  Conteudos: {
    endpoint: '/content',
    empty: { client_id: '', date: new Date().toISOString().slice(0, 10), type: 'post', theme: '', caption: '', status: 'ideia' },
    fields: [
      ['client_id', 'Cliente', 'client'], ['date', 'Data', 'date'], ['type', 'Tipo', 'select', ['post', 'reels', 'story', 'carrossel']],
      ['theme', 'Tema'], ['caption', 'Legenda', 'textarea'], ['status', 'Status', 'select', statusOptions.content]
    ],
    columns: [
      ['date', 'Data'], ['client_name', 'Cliente'], ['type', 'Tipo'], ['theme', 'Tema'], ['status', 'Status']
    ]
  },
  Tarefas: {
    endpoint: '/tasks',
    empty: { title: '', description: '', priority: 'media', due_date: new Date().toISOString().slice(0, 10), status: 'pendente' },
    fields: [
      ['title', 'Titulo'], ['priority', 'Prioridade', 'select', ['baixa', 'media', 'alta']], ['due_date', 'Data limite', 'date'],
      ['status', 'Status', 'select', statusOptions.task], ['description', 'Descricao', 'textarea']
    ],
    columns: [
      ['title', 'Tarefa'], ['priority', 'Prioridade'], ['due_date', 'Data limite'], ['status', 'Status']
    ]
  },
  Estudos: {
    endpoint: '/studies',
    empty: { theme: 'React', platform: '', studied_minutes: 30, date: new Date().toISOString().slice(0, 10), notes: '' },
    fields: [
      ['theme', 'Tema/area', 'select', ['Programacao', 'Dados', 'SQL', 'Python', 'React', 'Node']], ['platform', 'Plataforma'],
      ['studied_minutes', 'Tempo estudado em minutos', 'number'], ['date', 'Data', 'date'], ['notes', 'Observacoes', 'textarea']
    ],
    columns: [
      ['date', 'Data'], ['theme', 'Tema'], ['platform', 'Plataforma'], ['studied_minutes', 'Tempo', (row) => `${row.studied_minutes || 0} min`]
    ],
    summary: 'studies'
  }
};

export function CrudPage({ name }) {
  const config = modules[name];
  const [rows, setRows] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(config.empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [summary, setSummary] = useState(null);

  const fields = useMemo(() => config.fields.map(([name, label, type, options]) => ({
    name,
    label,
    type: type === 'client' ? 'select' : type,
    options: type === 'client'
      ? clients.map((client) => ({ value: client.id, label: client.company ? `${client.name} - ${client.company}` : client.name }))
      : Array.isArray(options) ? options.map((value) => ({ value, label: value })) : []
  })), [clients, config.fields]);

  const columns = config.columns.map(([key, label, render]) => ({ key, label, render }));

  useEffect(() => {
    load();
    api('/clients/options').then(setClients);
  }, [name]);

  async function load(params = {}) {
    const query = new URLSearchParams(params).toString();
    setRows(await api(`${config.endpoint}${query ? `?${query}` : ''}`));
    if (config.summary) {
      setSummary(await api(`/summary/${config.summary}`));
    }
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const path = editingId ? `${config.endpoint}/${editingId}` : config.endpoint;
    await api(path, { method, body: JSON.stringify(form) });
    reset();
    await load();
  }

  function reset() {
    setForm(config.empty);
    setEditingId(null);
    setShowForm(false);
  }

  async function remove(id) {
    if (!window.confirm('Excluir este registro?')) return;
    await api(`${config.endpoint}/${id}`, { method: 'DELETE' });
    await load();
  }

  function edit(row) {
    setForm({ ...config.empty, ...row });
    setEditingId(row.id);
    setShowForm(true);
  }

  async function applyFilters() {
    await load({ search, status });
  }

  return (
    <div className="page-stack">
      {summary && <SummaryBlocks name={name} summary={summary} />}
      <div className="toolbar">
        <div className="toolbar-filters">
          {config.filters && <input placeholder="Buscar cliente" value={search} onChange={(event) => setSearch(event.target.value)} />}
          {config.filters && (
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Todos os status</option>
              {statusOptions.client.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          )}
          {config.filters && <button className="secondary-button" onClick={applyFilters} type="button">Filtrar</button>}
        </div>
        <button className="primary-button compact" type="button" onClick={() => setShowForm(true)}>Novo</button>
      </div>

      {showForm && <EntityForm fields={fields} form={form} onCancel={reset} onChange={update} onSubmit={submit} submitLabel={editingId ? 'Salvar alteracoes' : 'Cadastrar'} />}

      <DataTable
        columns={columns}
        rows={rows}
        actions={(row) => (
          <>
            {name === 'Tarefas' && row.status !== 'concluida' && <button onClick={() => edit({ ...row, status: 'concluida' })}>Concluir</button>}
            {name === 'Conteudos' && row.status !== 'postado' && <button onClick={() => edit({ ...row, status: 'postado' })}>Postado</button>}
            <button onClick={() => edit(row)}>Editar</button>
            <button onClick={() => remove(row.id)}>Excluir</button>
          </>
        )}
      />
    </div>
  );
}

function SummaryBlocks({ name, summary }) {
  if (name === 'Financeiro') {
    return (
      <section className="mini-grid">
        <Mini title="Faturamento pago" value={money.format(summary.income)} />
        <Mini title="Despesas pagas" value={money.format(summary.expenses)} />
        <Mini title="Lucro estimado" value={money.format(summary.profit)} />
        <Mini title="Pendente" value={money.format(summary.pending)} />
      </section>
    );
  }

  return (
    <section className="mini-grid">
      <Mini title="Horas na semana" value={`${((summary.weekMinutes || 0) / 60).toFixed(1)}h`} />
      {summary.byTheme.slice(0, 3).map((item) => <Mini key={item.theme} title={item.theme} value={`${item.minutes} min`} />)}
    </section>
  );
}

function Mini({ title, value }) {
  return (
    <div className="mini-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}
