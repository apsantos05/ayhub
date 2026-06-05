import React from 'react';
import { Icon } from './Icon.jsx';

const items = [
  { label: 'Dashboard', icon: 'home' },
  { label: 'Clientes', icon: 'users' },
  { label: 'Propostas', icon: 'file' },
  { label: 'Financeiro', icon: 'wallet' },
  { label: 'Conteudos', icon: 'calendar' },
  { label: 'Tarefas', icon: 'check' },
  { label: 'Estudos', icon: 'graduation' },
  { label: 'Ideias', icon: 'idea' },
  { label: 'Usuarios', icon: 'user' },
  { label: 'Configuracoes', icon: 'settings' }
];

export function Sidebar({ activePage, onLogout, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">AY</div>
        <div>
          <strong>AY Hub</strong>
          <span>Social Media</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="Menu principal">
        {items.map((item) => {
          return (
            <button className={`nav-item ${activePage === item.label ? 'active' : ''}`} type="button" key={item.label} onClick={() => onNavigate(item.label)}>
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="logout-button" type="button" onClick={onLogout}>
        <Icon name="logout" size={18} />
        <span>Sair</span>
      </button>
    </aside>
  );
}
