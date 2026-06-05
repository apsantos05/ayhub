import React from 'react';
import { useEffect, useState } from 'react';
import { AppLayout } from './components/AppLayout.jsx';
import { CrudPage } from './pages/CrudPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { IdeasPage } from './pages/IdeasPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ProposalsPage } from './pages/ProposalsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { UsersPage } from './pages/UsersPage.jsx';

const titles = {
  Dashboard: 'AY Social Media',
  Clientes: 'Clientes',
  Propostas: 'Propostas',
  Financeiro: 'Financeiro',
  Conteudos: 'Calendario de Conteudo',
  Tarefas: 'Tarefas',
  Estudos: 'Estudos',
  Ideias: 'Gerador de Ideias',
  Usuarios: 'Usuarios do AY Hub',
  Configuracoes: 'Configuracoes'
};

export function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem('ayhub:session');
      const parsed = stored ? JSON.parse(stored) : null;

      if (!parsed?.token || !parsed?.user?.email) {
        return null;
      }

      return parsed;
    } catch {
      localStorage.removeItem('ayhub:session');
      return null;
    }
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem('ayhub:session', JSON.stringify(session));
    } else {
      localStorage.removeItem('ayhub:session');
    }
  }, [session]);

  if (!session) {
    return <LoginPage onLogin={setSession} />;
  }

  const user = session.user || { name: 'Arthur Pereira' };

  return (
    <AppLayout activePage={activePage} onLogout={() => setSession(null)} onNavigate={setActivePage} title={titles[activePage]} user={user}>
      {activePage === 'Dashboard' && <DashboardPage />}
      {['Clientes', 'Financeiro', 'Conteudos', 'Tarefas', 'Estudos'].includes(activePage) && <CrudPage name={activePage} />}
      {activePage === 'Propostas' && <ProposalsPage />}
      {activePage === 'Ideias' && <IdeasPage />}
      {activePage === 'Usuarios' && <UsersPage />}
      {activePage === 'Configuracoes' && <SettingsPage />}
    </AppLayout>
  );
}
