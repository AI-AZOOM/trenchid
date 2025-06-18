import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Connection, PublicKey } from '@solana/web3.js';

const HELIUS_API_KEY = '907b9096-8c99-4367-9858-b9820e362c29';
const HELIUS_RPC = `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`;
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

const LeaderboardContainer = styled.div`
  padding: 2rem;
  color: #0ff;
  font-family: 'Orbitron', monospace;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 10px cyan;
  text-align: center;
`;

const Filters = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background: none;
  border: 2px solid cyan;
  color: #0ff;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-family: 'Orbitron', monospace;
  cursor: pointer;

  &:hover {
    background: cyan;
    color: black;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-top: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 720px; /* Allows scroll if screen is narrower */
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid #00ffff88;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #00ffff44;
`;

type LeaderboardEntry = {
    rank: number;
    wallet: string;
    txs: number;
    tokens: number;
    nfts: number;
    age: number;
    score: number;
};

const Leaderboard: React.FC = () => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [filter, setFilter] = useState<'all' | 'nfts' | 'txs' | 'oldest'>('all');

    useEffect(() => {
        const connection = new Connection(HELIUS_RPC);

        const fetchWalletStats = async () => {
            const connected = localStorage.getItem('connectedWallets');
            if (!connected) return;

            const walletsToAnalyze: string[] = JSON.parse(connected);
            const results: LeaderboardEntry[] = [];

            for (const address of walletsToAnalyze) {
                const publicKey = new PublicKey(address);
                let txs = 0;
                let tokens = 0;
                let nfts = 0;
                let age = 0;

                try {
                    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 1000 });
                    txs = signatures.length;

                    if (signatures.length > 0) {
                        const earliest = signatures[signatures.length - 1];
                        const tx = await connection.getTransaction(earliest.signature, {
                            maxSupportedTransactionVersion: 0,
                        });
                        if (tx?.blockTime) {
                            const now = Math.floor(Date.now() / 1000);
                            age = Math.floor((now - tx.blockTime) / 86400);
                        }
                    }

                    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                        programId: TOKEN_PROGRAM_ID,
                    });
                    const filtered = tokenAccounts.value.filter(
                        acc => acc.account.data.parsed.info.tokenAmount.uiAmount > 0
                    );
                    tokens = filtered.length;

                    const nftRes = await fetch(
                        `https://api.helius.xyz/v0/addresses/${publicKey.toBase58()}/nfts?api-key=${HELIUS_API_KEY}`
                    );
                    const nftJson = await nftRes.json();
                    nfts = nftJson.length || 0;
                } catch (err) {
                    console.error(`Failed to fetch data for wallet ${address}:`, err);
                }

                const score = txs + tokens * 3 + nfts * 2 + age * 1.5;

                results.push({
                    rank: 0,
                    wallet: address,
                    txs,
                    tokens,
                    nfts,
                    age,
                    score,
                });
            }

            let sorted = results;
            if (filter === 'nfts') sorted = [...results].sort((a, b) => b.nfts - a.nfts);
            else if (filter === 'txs') sorted = [...results].sort((a, b) => b.txs - a.txs);
            else if (filter === 'oldest') sorted = [...results].sort((a, b) => b.age - a.age);
            else sorted = [...results].sort((a, b) => b.score - a.score);

            sorted.forEach((entry, idx) => (entry.rank = idx + 1));
            setEntries(sorted);
        };

        fetchWalletStats();
    }, [filter]);

    return (
        <LeaderboardContainer>
            <Title>🏅 Wallet Leaderboard</Title>
            <Filters>
                <FilterButton onClick={() => setFilter('all')}>All</FilterButton>
                <FilterButton onClick={() => setFilter('nfts')}>NFT Whales</FilterButton>
                <FilterButton onClick={() => setFilter('txs')}>Tx Volume</FilterButton>
                <FilterButton onClick={() => setFilter('oldest')}>Oldest</FilterButton>
            </Filters>
            <TableWrapper>
                <Table>
                    <thead>
                        <tr>
                            <Th>Rank</Th>
                            <Th>Wallet</Th>
                            <Th>TXs</Th>
                            <Th>Tokens</Th>
                            <Th>NFTs</Th>
                            <Th>Age</Th>
                            <Th>Score</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(({ rank, wallet, txs, tokens, nfts, age, score }) => (
                            <tr key={wallet}>
                                <Td>#{rank}</Td>
                                <Td>{wallet.slice(0, 4)}...{wallet.slice(-4)}</Td>
                                <Td>{txs}</Td>
                                <Td>{tokens}</Td>
                                <Td>{nfts}</Td>
                                <Td>{age}d</Td>
                                <Td>{score.toFixed(1)}</Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableWrapper>
        </LeaderboardContainer>
    );
};

export default Leaderboard;
