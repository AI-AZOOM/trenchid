import { useState } from 'react';
import styled from 'styled-components';
import { Connection, PublicKey } from '@solana/web3.js';

const HELIUS_API_KEY = '907b9096-8c99-4367-9858-b9820e362c29';
const HELIUS_RPC = `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`;
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

const Page = styled.div`
  color: #00fff7;
  text-align: center;
  padding: 4rem 2rem;
  font-family: 'Orbitron', monospace;
  font-size: 1.25rem;
`;

const Input = styled.input`
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  border-radius: 10px;
  border: 2px solid cyan;
  background: #000;
  color: #00fff7;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 400px;
`;

const Button = styled.button`
  padding: 0.7rem 1.4rem;
  margin-left: 1rem;
  font-size: 1rem;
  background: #00fff7;
  color: #000;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-family: 'Orbitron', monospace;

  &:hover {
    background: #00cccc;
  }
`;

const InfoBox = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 12px;
  display: grid;
  gap: 1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 0 20px cyan;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed cyan;
  padding-bottom: 0.5rem;
`;

const Explorer = () => {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [walletInfo, setWalletInfo] = useState<any>(null);

    const fetchWalletData = async () => {
        setLoading(true);
        try {
            const connection = new Connection(HELIUS_RPC);
            const publicKey = new PublicKey(address);

            const txs = await connection.getSignaturesForAddress(publicKey, { limit: 1000 });
            const txCount = txs.length;

            let walletAge = 'Unknown';
            if (txs.length > 0) {
                const earliest = txs[txs.length - 1];
                const tx = await connection.getTransaction(earliest.signature, {
                    maxSupportedTransactionVersion: 0,
                });

                if (tx?.blockTime) {
                    const now = Math.floor(Date.now() / 1000);
                    const days = Math.floor((now - tx.blockTime) / 86400);
                    walletAge = days < 1 ? '<1 day' : `${days} days`;
                }
            }

            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                programId: TOKEN_PROGRAM_ID,
            });

            const filtered = tokenAccounts.value.filter(
                (acc) => acc.account.data.parsed.info.tokenAmount.uiAmount > 0
            );
            const mints = filtered.map((acc) => acc.account.data.parsed.info.mint);

            const tokenSymbols: string[] = [];
            try {
                const metaRes = await fetch(`https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mintAccounts: mints }),
                });
                if (metaRes.ok) {
                    const metaJson = await metaRes.json();
                    metaJson.forEach((entry: any) => {
                        if (entry?.symbol) tokenSymbols.push(entry.symbol);
                    });
                }
            } catch (err) {
                console.warn('Failed to fetch token metadata:', err);
            }

            let nftCount = 0;
            try {
                const nftRes = await fetch(
                    `https://api.helius.xyz/v0/addresses/${publicKey.toBase58()}/nfts?api-key=${HELIUS_API_KEY}`
                );
                if (nftRes.ok) {
                    const nfts = await nftRes.json();
                    nftCount = nfts.length || 0;
                }
            } catch (err) {
                console.warn('Helius NFT API error:', err);
            }

            setWalletInfo({
                txCount,
                walletAge,
                tokensHeldCount: filtered.length,
                tokenSymbols,
                nftCount,
            });
        } catch (err) {
            console.error(err);
            setWalletInfo(null);
        }
        setLoading(false);
    };

    return (
        <Page>
            <h2>🛰️ Explorer Module</h2>
            <p>Enter a wallet address to analyze its onchain footprint.</p>
            <div>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter wallet address" />
                <Button onClick={fetchWalletData}>Analyze</Button>
            </div>

            {loading && <p>Loading...</p>}

            {walletInfo && (
                <InfoBox>
                    <InfoItem><span>Transaction Count:</span><span>{walletInfo.txCount}</span></InfoItem>
                    <InfoItem><span>Wallet Age:</span><span>{walletInfo.walletAge}</span></InfoItem>
                    <InfoItem><span>Tokens Held:</span><span>{walletInfo.tokenSymbols.join(', ') || walletInfo.tokensHeldCount}</span></InfoItem>
                    <InfoItem><span>NFTs Minted or Held:</span><span>{walletInfo.nftCount}</span></InfoItem>
                </InfoBox>
            )}
        </Page>
    );
};

export default Explorer;
