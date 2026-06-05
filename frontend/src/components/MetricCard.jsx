import React from 'react';
import { Icon } from './Icon.jsx';

export function MetricCard({ title, value, hint, icon }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">
        <Icon name={icon} size={20} />
      </div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </article>
  );
}
