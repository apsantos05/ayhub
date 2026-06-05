import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import './styles/global.css';

const rootElement = document.getElementById('root');

try {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  rootElement.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;background:#f4f7fb;color:#172230;font-family:Arial,sans-serif;padding:24px;">
      <section style="width:min(100%,460px);background:#fff;border:1px solid #dbe3ec;border-radius:8px;padding:28px;">
        <h1>AY Hub</h1>
        <p>Erro ao iniciar o front-end.</p>
        <pre style="white-space:pre-wrap;background:#fff2f0;padding:12px;border-radius:8px;">${error.message}</pre>
      </section>
    </main>
  `;
}
