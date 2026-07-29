/**
 * @fileoverview Bootstrap da aplicação React da landing page.
 *
 * @module landing/main
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento #root não encontrado. A landing não pode ser inicializada.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
