import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders app without crashing', () => {
  // Envolvamos en BrowserRouter si App lo requiere
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});
