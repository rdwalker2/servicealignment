import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const initFortressDefenses = () => {
  const asciiArt = `
            |>>>                                |>>>
            |                                   |
        _  _|_  _                           _  _|_  _
       |;|_|;|_|;|                         |;|_|;|_|;|
       \\\\.    .  /                           \\\\.    .  /
        \\\\:  .  /                             \\\\:  .  /
         ||:   |                               ||:   |
         ||:   |                               ||:   |
         ||:   |                               ||:   |
         ||:   |                               ||:   |
         ||:   |                               ||:   |
         ||:   |       FORTRESS MODE           ||:   |
         ||:   |       ACTIVATED               ||:   |
         ||:   |                               ||:   |
_________||:___|_______________________________||:___|_______
  `;
  console.log(
    '%c' + asciiArt,
    'color: #10b981; font-weight: bold; font-family: monospace;'
  );
  console.log(
    '%cWARNING: RESTRICTED ASSET',
    'color: #ef4444; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 0px #000;'
  );
  console.log(
    '%cThis is a secured predictive marketing asset by Service Alignment.\\nUnauthorized access, probing, or testing is strictly prohibited.\\nYour connection metrics have been logged.',
    'color: #f59e0b; font-size: 14px; font-family: monospace;'
  );

  // Anti-Reverse Engineering Trap (only active in Production)
  if (import.meta.env.PROD) {
    setInterval(() => {
      // eslint-disable-next-line no-debugger
      debugger;
    }, 2000); // Triggers a debugger pause every 2 seconds if devtools are open
  }
};

initFortressDefenses();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
