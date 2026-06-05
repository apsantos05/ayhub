import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="login-shell">
          <section className="login-panel">
            <div className="login-brand">
              <div className="brand-mark">AY</div>
              <div>
                <strong>AY Hub</strong>
                <span>Erro ao carregar o painel</span>
              </div>
            </div>
            <div className="status-box error" style={{ marginTop: 24 }}>
              {this.state.error.message || 'O front-end encontrou um erro.'}
            </div>
            <button className="primary-button" type="button" style={{ marginTop: 16, width: '100%' }} onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
