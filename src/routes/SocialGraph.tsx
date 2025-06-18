import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import ForceGraph2D from 'react-force-graph-2d';
import { useWallet } from '@solana/wallet-adapter-react';

const GraphWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  height: 80vh;
  background: rgba(0, 255, 255, 0.05);
  border: 2px solid cyan;
  border-radius: 12px;
  margin-top: 2rem;
  overflow: hidden;

  @media (max-width: 640px) {
    height: 60vh;
  }
`;

const Title = styled.h2`
  color: #00fff7;
  font-family: 'Orbitron', monospace;
  text-align: center;
  font-size: 2rem;
`;

const Loading = styled.div`
  color: #00fff7;
  text-align: center;
  margin-top: 3rem;
  font-family: 'Orbitron', monospace;
`;

const SocialGraph = () => {
    const fgRef = useRef<any>(null);
    const { publicKey } = useWallet();
    const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
        nodes: [],
        links: [],
    });

    useEffect(() => {
        if (!publicKey) return;

        const address = publicKey.toBase58();
        const HELIUS_API_KEY = '907b9096-8c99-4367-9858-b9820e362c29';

        const fetchGraphData = async () => {
            try {
                const res = await fetch(
                    `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=50`
                );
                const txs = await res.json();

                const frequencyMap: Record<string, number> = {};
                const links: any[] = [];

                txs.forEach((tx: any) => {
                    const accounts = tx?.events?.programs?.flatMap((e: any) => e.accounts) || [];
                    accounts.forEach((acc: string) => {
                        if (acc !== address) {
                            links.push({ source: address, target: acc });
                            frequencyMap[acc] = (frequencyMap[acc] || 0) + 1;
                        }
                    });
                });

                const uniqueWallets = Object.keys(frequencyMap);
                const nodes = [{ id: address, group: 1 }];
                uniqueWallets.forEach((wallet) => {
                    nodes.push({ id: wallet, group: frequencyMap[wallet] });
                });

                setGraphData({ nodes, links });
            } catch (err) {
                console.error('Error fetching transaction data:', err);
                setGraphData({ nodes: [], links: [] });
            }
        };

        fetchGraphData();
    }, [publicKey]);

    const onlySelfNode = graphData.nodes.length === 1;

    return (
        <>
            <Title>🤖 Wallet Relationship Graph</Title>
            {graphData.nodes.length === 0 ? (
                <Loading>Loading graph...</Loading>
            ) : onlySelfNode ? (
                <Loading>No interactions found for this wallet.</Loading>
            ) : (
                <GraphWrapper>
                    <ForceGraph2D
                        ref={fgRef}
                        graphData={graphData}
                        nodeAutoColorBy="group"
                        nodeLabel={(node: any) => `${node.id}`}
                        linkColor={() => '#00ffff'}
                        linkDirectionalParticles={1}
                        linkDirectionalParticleSpeed={0.005}
                    />
                </GraphWrapper>
            )}
        </>
    );
};

export default SocialGraph;
