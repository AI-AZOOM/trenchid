import React, { type FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  TrustWalletAdapter,
  AlphaWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// ✅ Use ESM import instead of require
import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const network: WalletAdapterNetwork = WalletAdapterNetwork.Mainnet;
  const endpoint = clusterApiUrl(network);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new AlphaWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TrustWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
