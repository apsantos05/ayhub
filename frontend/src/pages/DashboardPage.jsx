import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { MetricCard } from '../components/MetricCard.jsx';
import { api } from '../services/api.js';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/dashboard')
      .then(setDashboard)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const data = dashboard?.metrics || {};
    return [
      {
        title: 'Total de clientes',
        value: data.totalClients || 0,
        hint: 'ativos e pendentes',
        icon: 'users'
      },
      {
        title: 'Valor mensal previsto',
        value: money.format(data.monthlyForecast || 0),
        hint: 'clientes ativos',
        icon: 'chart'
      },
      {
        title: 'Pagamentos pendentes',
        value: money.format(data.pendingPayments || 0),
        hint: 'entradas em aberto',
        icon: 'wallet'
      },
      {
        title: 'Tarefas do dia',
        value: data.todayTasks || 0,
        hint: 'pendentes hoje',
        icon: 'task'
      },
      {
        title: 'Proximos conteudos',
        value: data.upcomingContent || 0,
        hint: 'na fila editorial',
        icon: 'calendar'
      },
      {
        title: 'Propostas abertas',
        value: data.openProposals || 0,
        hint: 'rascunho ou enviadas',
        icon: 'file'
      }
    ];
  }, [dashboard]);

  return (
    <>
        {loading && <div className="status-box">Carregando painel...</div>}
        {error && <div className="status-box error">{error}</div>}

        {!loading && !error && (
          <>
            <section className="metrics-grid" aria-label="Indicadores principais">
              {metrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
              ))}
            </section>

            <section className="dashboard-grid">
              <div className="panel">
                <div className="panel-header">
                  <h2>Tarefas em foco</h2>
                  <span>Hoje e proximos prazos</span>
                </div>
                <div className="list-stack">
                  {dashboard.tasks.length === 0 && <p className="empty-text">Nenhuma tarefa pendente.</p>}
                  {dashboard.tasks.map((task) => (
                    <div className="list-row" key={task.id}>
                      <div>
                        <strong>{task.title}</strong>
                        <span>{task.due_date || 'Sem data'}</span>
                      </div>
                      <span className={`badge ${task.priority}`}>{task.priority}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h2>Proximos conteudos</h2>
                  <span>Calendario editorial</span>
                </div>
                <div className="list-stack">
                  {dashboard.content.length === 0 && <p className="empty-text">Nenhum conteudo agendado.</p>}
                  {dashboard.content.map((content) => (
                    <div className="list-row" key={content.id}>
                      <div>
                        <strong>{content.theme}</strong>
                        <span>{content.client_name || 'Sem cliente'} - {content.date}</span>
                      </div>
                      <span className="badge neutral">{content.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
    </>
  );
}
