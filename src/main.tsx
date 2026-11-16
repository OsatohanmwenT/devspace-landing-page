import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import HeroV6 from './components/hero-v6/hero-v6.tsx';
import './index.css';

// Prototype switch: /?hero=v6 shows the v6 hero on its own; everything else is the live page.
const showHeroV6 = new URLSearchParams(window.location.search).get('hero') === 'v6';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {showHeroV6 ? <HeroV6 /> : <App />}
  </StrictMode>,
)
