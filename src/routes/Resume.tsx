import { useEffect, useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Connection } from '@solana/web3.js';
import html2canvas from 'html2canvas';

const HELIUS_API_KEY = '907b9096-8c99-4367-9858-b9820e362c29';
const HELIUS_RPC = `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`;
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

const ResumeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  min-height: 100vh;
  overflow-y: auto;
  background: #000015;
`;

const Title = styled.h2`
  font-size: 2.4rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 15px cyan;
  font-family: 'Orbitron', monospace;
  color: #00fff7;
`;

const WalletButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;

  .custom-wallet-btn {
    background: linear-gradient(135deg, #00fff7, #008080);
    color: #000;
    font-weight: 700;
    padding: 0.9rem 2rem;
    border-radius: 14px;
    box-shadow: 0 0 20px #00fff7;
    font-family: 'Orbitron', monospace;
    cursor: pointer;
    letter-spacing: 1.1px;
    border: 2px solid cyan;
    animation: breathingGlow 3s ease-in-out infinite;
    transition: all 0.3s ease;
    font-size: 1.05rem;

    &:hover {
      background: linear-gradient(135deg, #008080, #00fff7);
      box-shadow: 0 0 30px #00fff7;
    }
  }

  @keyframes breathingGlow {
    0% {
      box-shadow: 0 0 15px #00fff7, 0 0 30px #00aaff inset;
    }
    50% {
      box-shadow: 0 0 30px #00fff7, 0 0 60px #00aaff inset;
    }
    100% {
      box-shadow: 0 0 15px #00fff7, 0 0 30px #00aaff inset;
    }
  }

  .wallet-address {
    font-family: 'Orbitron', monospace;
    color: #00fff7;
    font-weight: 700;
    font-size: 1rem;
    background: rgba(0, 255, 255, 0.15);
    padding: 0.3rem 0.8rem;
    border-radius: 10px;
    user-select: text;
  }
`;

const InfoBox = styled.div`
  background: rgba(0, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 720px;
  display: grid;
  gap: 1.5rem;
  box-shadow: 0 0 30px #00fff7;
  font-family: 'Orbitron', monospace;
  color: #00fff7;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed cyan;
  padding-bottom: 0.4rem;
`;

const Label = styled.label`
  font-weight: 700;
  color: #00fff7;
  text-transform: uppercase;
  letter-spacing: 1.3px;
  font-size: 0.95rem;
`;

const Value = styled.span`
  color: #a0ffff;
  font-size: 1.25rem;
  font-weight: 600;
  user-select: text;
`;

const DownloadButton = styled.button`
  background: linear-gradient(135deg, #00fff7, #008080);
  color: #000;
  font-weight: 700;
  padding: 1rem 2.2rem;
  border-radius: 14px;
  box-shadow: 0 0 20px #00fff7;
  font-family: 'Orbitron', monospace;
  cursor: pointer;
  letter-spacing: 1.1px;
  border: 2px solid cyan;
  margin-top: 2.5rem;
  font-size: 1.05rem;

  &:hover {
    background: linear-gradient(135deg, #008080, #00fff7);
    box-shadow: 0 0 30px #00fff7;
  }
`;

function formatWalletAge(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    if (days < 1) return '< 1 day';
    if (days === 1) return '1 day';
    return `${days} days`;
}

function shortenAddress(address: string): string {
    return address.slice(0, 4) + '...' + address.slice(-4);
}

function Resume() {
    const { publicKey } = useWallet();
    const { setVisible } = useWalletModal();
    const connection = useMemo(() => new Connection(HELIUS_RPC), []);
    const resumeRef = useRef(null);

    const [walletInfo, setWalletInfo] = useState({
        txCount: 0,
        tokensHeldCount: 0,
        nftCount: 0,
        walletAge: '',
        tokenSymbols: [] as string[],
    });

    useEffect(() => {
        if (!publicKey) {
            setWalletInfo({ txCount: 0, tokensHeldCount: 0, nftCount: 0, walletAge: '', tokenSymbols: [] });
            return;
        }

        const connectedWallets = JSON.parse(localStorage.getItem('connectedWallets') || '[]');
        if (!connectedWallets.includes(publicKey.toBase58())) {
            connectedWallets.push(publicKey.toBase58());
            localStorage.setItem('connectedWallets', JSON.stringify(connectedWallets));
        }

        const fetchWalletData = async () => {
            try {
                const txSignatures = await connection.getSignaturesForAddress(publicKey, { limit: 1000 });
                const txCount = txSignatures.length;

                let walletAge = 'No transactions or new wallet';
                if (txCount > 0) {
                    const earliestSig = txSignatures[txSignatures.length - 1].signature;
                    const earliestTxn = await connection.getTransaction(earliestSig);
                    if (earliestTxn?.blockTime) {
                        const now = Math.floor(Date.now() / 1000);
                        walletAge = formatWalletAge(now - earliestTxn.blockTime);
                    }
                }

                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                    programId: TOKEN_PROGRAM_ID,
                });

                const filtered = tokenAccounts.value.filter(
                    (acc) => acc.account.data.parsed.info.tokenAmount.uiAmount > 0
                );

                const tokenSymbols: string[] = [];
                const mints = filtered.map((acc) => acc.account.data.parsed.info.mint);

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

                let nftCount = 0;
                try {
                    const heliusRes = await fetch(
                        `https://api.helius.xyz/v0/addresses/${publicKey.toBase58()}/nfts?api-key=${HELIUS_API_KEY}`
                    );

                    if (heliusRes.ok) {
                        const heliusJson = await heliusRes.json();
                        nftCount = heliusJson.length || 0;
                    }
                } catch (err) {
                    console.error('Helius NFT fetch error:', err);
                }

                setWalletInfo({
                    txCount,
                    tokensHeldCount: filtered.length,
                    nftCount,
                    walletAge,
                    tokenSymbols,
                });
            } catch (err) {
                console.error('Wallet fetch error:', err);
            }
        };

        fetchWalletData();
    }, [publicKey, connection]);

    const downloadResumePNG = async () => {
        const element = resumeRef.current;
        if (!element) return;

        const canvas = await html2canvas(element as HTMLElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
        });

        const imgData = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'onchain-resume.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <ResumeContainer>
            <Title>Onchain Resume</Title>
            <WalletButtonWrapper>
                <button className="custom-wallet-btn" onClick={() => setVisible(true)}>
                    {publicKey ? '🛸 Wallet Connected' : '🛸 Select Wallet'}
                </button>
                {publicKey && <div className="wallet-address">{shortenAddress(publicKey.toBase58())}</div>}
            </WalletButtonWrapper>
            {!publicKey ? (
                <p style={{ color: '#00fff7', fontFamily: 'Orbitron, monospace' }}>
                    Please connect your wallet to generate your onchain resume.
                </p>
            ) : (
                <>
                    <div ref={resumeRef}>
                        {publicKey && (
                            <div
                                style={{
                                    fontFamily: 'Orbitron, monospace',
                                    fontSize: '1rem',
                                    color: '#00fff7',
                                    background: 'rgba(0, 255, 255, 0.08)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '10px',
                                    marginBottom: '1.5rem',
                                    border: '1px solid cyan',
                                    textAlign: 'center',
                                }}
                            >
                                🧬 Wallet: {shortenAddress(publicKey.toBase58())}
                            </div>
                        )}
                        <InfoBox>
                            <InfoItem>
                                <Label>Transaction Count</Label>
                                <Value>{walletInfo.txCount}</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Wallet Age</Label>
                                <Value>{walletInfo.walletAge}</Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>Tokens Held</Label>
                                <Value>
                                    {walletInfo.tokenSymbols.length > 0
                                        ? walletInfo.tokenSymbols.join(', ')
                                        : walletInfo.tokensHeldCount}
                                </Value>
                            </InfoItem>
                            <InfoItem>
                                <Label>NFTs Minted or Held</Label>
                                <Value>{walletInfo.nftCount}</Value>
                            </InfoItem>
                        </InfoBox>
                    </div>
                    {publicKey && <DownloadButton onClick={downloadResumePNG}>Download Resume</DownloadButton>}
                </>
            )}
        </ResumeContainer>
    );
}

export default Resume;
