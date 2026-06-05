import React from 'react';
import { Sidebar } from './Sidebar.jsx';

export function AppLayout({ activePage, children, onLogout, onNavigate, title, user }) {
  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onLogout={onLogout} onNavigate={onNavigate} />
      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">{activePage}</span>
            <h1>{title}</h1>
          </div>
          <div className="user-chip">
            <span>{user.name}</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
