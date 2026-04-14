import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeRecoverySystem } from './utils/recovery';
import { initializeGlobalErrorHandlers } from './utils/errorHandling';

// Initialize performance recovery system
initializeRecoverySystem();

// Initialize global error suppression
initializeGlobalErrorHandlers();

// Mount application
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
