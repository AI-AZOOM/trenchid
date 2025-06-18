import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'typeface-orbitron';
import { WalletProvider } from './context/WalletProvider';
import { Buffer } from 'buffer';

window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>,
);
