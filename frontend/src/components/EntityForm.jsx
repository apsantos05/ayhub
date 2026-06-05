import React from 'react';

export function EntityForm({ fields, form, onCancel, onChange, onSubmit, submitLabel }) {
  return (
    <form className="entity-form" onSubmit={onSubmit}>
      {fields.map((field) => (
        <label className={field.type === 'textarea' ? 'field-wide' : ''} key={field.name}>
          {field.label}
          {field.type === 'select' ? (
            <select value={form[field.name] ?? ''} onChange={(event) => onChange(field.name, event.target.value)}>
              <option value="">Selecione</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea value={form[field.name] ?? ''} onChange={(event) => onChange(field.name, event.target.value)} rows={4} />
          ) : (
            <input
              type={field.type || 'text'}
              value={form[field.name] ?? ''}
              onChange={(event) => onChange(field.name, event.target.value)}
              step={field.type === 'number' ? '0.01' : undefined}
            />
          )}
        </label>
      ))}
      <div className="form-actions field-wide">
        <button className="primary-button compact" type="submit">{submitLabel}</button>
        <button className="secondary-button" type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
