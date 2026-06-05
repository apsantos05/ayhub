import React from 'react';

const symbols = {
  chart: '#',
  calendar: 'D',
  check: 'V',
  file: 'F',
  graduation: 'G',
  home: 'H',
  idea: '*',
  lock: 'L',
  logout: '>',
  mail: '@',
  settings: 'S',
  users: 'U',
  user: 'P',
  wallet: '$',
  task: 'T'
};

export function Icon({ name, size = 18 }) {
  return (
    <span className="local-icon" style={{ width: size, height: size, fontSize: Math.max(12, size - 4) }} aria-hidden="true">
      {symbols[name] || '.'}
    </span>
  );
}
