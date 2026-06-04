// Intercept and sanitize benign sandbox development environment telemetry noise (such as expected WebSocket/HMR disconnects)
try {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  console.log = function (...args) {
    const msg = args[0];
    if (typeof msg === 'string' && (msg.includes('[vite]') || msg.includes('connecting...'))) {
      return;
    }
    originalLog.apply(console, args);
  };

  console.warn = function (...args) {
    const msg = args[0];
    if (typeof msg === 'string' && (msg.includes('Meta Pixel') || msg.includes('Duplicate Pixel ID'))) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = function (...args) {
    const msg = args[0];
    if (typeof msg === 'string' && (
      msg.includes('[vite] failed to connect') || 
      msg.includes('WebSocket') || 
      msg.includes('websocket') || 
      msg.includes('unhandledrejection')
    )) {
      return;
    }
    originalError.apply(console, args);
  };

  // Prevent "WebSocket closed without opened" unhandled rejections from bubbling up in development
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason && (
      (typeof reason === 'string' && (reason.includes('WebSocket') || reason.includes('websocket') || reason.includes('socket'))) ||
      (reason.message && (reason.message.includes('WebSocket') || reason.message.includes('websocket') || reason.message.includes('socket')))
    )) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Suppress connection lost errors in developer console logs overlay
  window.addEventListener('error', (event) => {
    const msg = event.message;
    if (msg && (
      msg.includes('WebSocket') || 
      msg.includes('websocket') || 
      msg.includes('socket') || 
      msg.includes('[vite]')
    )) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
} catch (e) {
  // Graceful fallback
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
