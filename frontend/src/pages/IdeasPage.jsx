import React from 'react';
import { useState } from 'react';

export function IdeasPage() {
  const [form, setForm] = useState({ niche: '', goal: '', audience: '' });
  const [ideas, setIdeas] = useState(null);

  function generate(event) {
    event.preventDefault();
    const niche = form.niche || 'negocio local';
    const goal = form.goal || 'gerar engajamento';
    const audience = form.audience || 'clientes em potencial';
    setIdeas({
      posts: [
        `3 erros que ${audience} cometem em ${niche}`,
        `Antes e depois: como ${niche} resolve um problema real`,
        `Checklist rapido para quem quer ${goal}`
      ],
      reels: [
        `Bastidores de um atendimento em ${niche}`,
        `Mito ou verdade sobre ${niche}`,
        `Transformacao em 15 segundos com foco em ${audience}`
      ],
      stories: [
        `Enquete: qual maior dificuldade com ${niche}?`,
        `Caixinha: mande sua duvida sobre ${goal}`,
        `Prova social com depoimento curto`
      ],
      captions: [
        `Se voce quer ${goal}, comece entendendo este ponto: ${niche} precisa de constancia e clareza. Salve este post para rever depois.`,
        `${audience} nao precisam de mais promessa. Precisam de caminho simples, exemplo real e acao.`
      ],
      ctas: ['Chame no WhatsApp', 'Salve para consultar depois', 'Envie para alguem que precisa disso']
    });
  }

  return (
    <div className="page-stack">
      <form className="entity-form" onSubmit={generate}>
        <label>Nicho do cliente<input value={form.niche} onChange={(event) => setForm({ ...form, niche: event.target.value })} /></label>
        <label>Objetivo do conteudo<input value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} /></label>
        <label>Publico-alvo<input value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} /></label>
        <div className="form-actions field-wide"><button className="primary-button compact" type="submit">Gerar ideias</button></div>
      </form>
      {ideas && <div className="ideas-grid">{Object.entries(ideas).map(([title, items]) => (
        <div className="panel" key={title}><div className="panel-header"><h2>{title}</h2></div><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>
      ))}</div>}
    </div>
  );
}
