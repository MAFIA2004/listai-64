
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Prevenir parpadeo de tema
document.documentElement.classList.add('dark-mode-transition');

// Añadir class para efectos de transición suaves
document.documentElement.classList.add('transition-colors', 'duration-300');

createRoot(document.getElementById("root")!).render(<App />);
