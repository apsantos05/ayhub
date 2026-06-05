import React from 'react';
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { DataTable } from '../components/DataTable.jsx';
import { EntityForm } from '../components/EntityForm.jsx';

const emptyUser = {
  name: '',
  email: '',
  password: '',
  role: 'funcionario',
  status: 'ativo'
};

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyUser);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setUsers(await api('/users'));
  }

  function reset() {
    setForm(emptyUser);
    setEditingId(null);
    setShowForm(false);
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    setError('');

    try {
      await api(editingId ? `/users/${editingId}` : '/users', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(form)
      });
      reset();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function edit(user) {
    setForm({ ...user, password: '' });
    setEditingId(user.id);
    setShowForm(true);
  }

  async function remove(id) {
    if (!window.confirm('Excluir este usuario?')) return;
    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-stack">
      <div className="toolbar">
        <span className="empty-text">Cadastre socios e funcionarios que acessam o AY Hub.</span>
        <button className="primary-button compact" type="button" onClick={() => setShowForm(true)}>Novo usuario</button>
      </div>

      {error && <div className="status-box error">{error}</div>}

      {showForm && (
        <EntityForm
          fields={[
            { name: 'name', label: 'Nome' },
            { name: 'email', label: 'E-mail', type: 'email' },
            { name: 'password', label: editingId ? 'Nova senha (opcional)' : 'Senha', type: 'password' },
            { name: 'role', label: 'Perfil', type: 'select', options: [
              { value: 'admin', label: 'admin' },
              { value: 'socia', label: 'socia' },
              { value: 'funcionario', label: 'funcionario' }
            ] },
            { name: 'status', label: 'Status', type: 'select', options: [
              { value: 'ativo', label: 'ativo' },
              { value: 'inativo', label: 'inativo' }
            ] }
          ]}
          form={form}
          onCancel={reset}
          onChange={(field, value) => setForm({ ...form, [field]: value })}
          onSubmit={submit}
          submitLabel={editingId ? 'Salvar usuario' : 'Cadastrar usuario'}
        />
      )}

      <DataTable
        columns={[
          { key: 'name', label: 'Nome' },
          { key: 'email', label: 'E-mail' },
          { key: 'role', label: 'Perfil' },
          { key: 'status', label: 'Status' },
          { key: 'created_at', label: 'Criado em' }
        ]}
        rows={users}
        actions={(user) => (
          <>
            <button onClick={() => edit(user)}>Editar</button>
            <button onClick={() => remove(user.id)}>Excluir</button>
          </>
        )}
      />
    </div>
  );
}
