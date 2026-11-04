import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { iconNames } from '@cuttle-ui/icons';
import { Icon } from '@cuttle-ui/icons/react';
import '@cuttle-ui/styles';
import { Components } from './components';
import './playground.css';

type Theme = 'system' | 'light' | 'dark';

const COLORS = [
  'accent',
  'accent-tint',
  'bg',
  'surface',
  'surface-tint',
  'border',
  'text',
  'text-muted',
  'danger',
  'success',
  'warning',
];
const RADII = ['radius-sm', 'radius', 'radius-lg', 'radius-pill'];
const SHADOWS = ['shadow-sm', 'shadow', 'shadow-lg'];

const showComponents = new URLSearchParams(window.location.search).get('view') === 'components';

function App() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <main className="page">
      <header className="header">
        <h1>{showComponents ? 'Cuttle components' : 'Cuttle tokens'}</h1>
        <div role="group" aria-label="Theme" className="themes">
          {(['system', 'light', 'dark'] as const).map((option) => (
            <button
              key={option}
              type="button"
              className="cuttle-focus chip"
              aria-pressed={theme === option}
              onClick={() => setTheme(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </header>

      {showComponents ? <Components /> : <Tokens />}
    </main>
  );
}

function Tokens() {
  return (
    <>
      <section aria-labelledby="colors">
        <h2 id="colors">Color</h2>
        <ul className="grid">
          {COLORS.map((name) => (
            <li key={name} className="tile">
              <span className="swatch" style={{ background: `var(--cuttle-${name})` }} />
              <code>{name}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="shape">
        <h2 id="shape">Radius and elevation</h2>
        <ul className="grid">
          {RADII.map((name) => (
            <li key={name} className="tile">
              <span className="swatch" style={{ borderRadius: `var(--cuttle-${name})` }} />
              <code>{name}</code>
            </li>
          ))}
          {SHADOWS.map((name) => (
            <li key={name} className="tile">
              <span className="swatch" style={{ boxShadow: `var(--cuttle-${name})` }} />
              <code>{name}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="icons">
        <h2 id="icons">Icons</h2>
        <ul className="icons">
          {iconNames.map((name) => (
            <li key={name}>
              <Icon name={name} aria-label={name} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="focus">
        <h2 id="focus">Shimmer focus</h2>
        <p>Press Tab to reach this button.</p>
        <button type="button" className="cuttle-focus action">
          Focus me
        </button>
      </section>
    </>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
