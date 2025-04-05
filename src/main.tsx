import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/micro-interactions.css'
import './styles/navbar-override.css' // Keep only the main navbar styling

createRoot(document.getElementById("root")!).render(<App />);
