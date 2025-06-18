import React from 'react';
import styled from 'styled-components';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';

const Page = styled.div`
  font-family: 'Orbitron', monospace;
  color: #00fff7;
  padding: 3rem 2rem;
  text-align: center;
  background: radial-gradient(circle at top, #000020 0%, #000015 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid cyan;
  padding-bottom: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  text-shadow: 0 0 8px cyan;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

const WalletButton = styled.button`
  background: linear-gradient(135deg, #00fff7, #008080);
  color: #000;
  font-weight: 700;
  padding: 0.7rem 1.4rem;
  border-radius: 12px;
  font-size: 1rem;
  border: 2px solid cyan;
  box-shadow: 0 0 20px cyan;
  cursor: pointer;
  animation: pulse 2.5s ease-in-out infinite;

  &:hover {
    background: linear-gradient(135deg, #008080, #00fff7);
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 10px #00fff7;
    }
    50% {
      box-shadow: 0 0 25px #00fff7;
    }
    100% {
      box-shadow: 0 0 10px #00fff7;
    }
  }
`;

const WalletAddress = styled.div`
  font-family: 'Orbitron', monospace;
  color: #00fff7;
  font-weight: 700;
  font-size: 1rem;
  background: rgba(0, 255, 255, 0.15);
  padding: 0.3rem 0.8rem;
  border-radius: 10px;
  user-select: text;
`;

const Banner = styled.div`
  font-size: 1.6rem;
  color: cyan;
  border: 2px dashed cyan;
  padding: 1.2rem;
  margin: 2rem 0;
  border-radius: 10px;

  @media (max-width: 640px) {
    font-size: 1.2rem;
    padding: 1rem;
  }
`;

const Buttons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
  margin: 2rem 0;
`;

const NavButton = styled(Link)`
  display: block;
  padding: 1.2rem;
  background: rgba(0, 255, 255, 0.1);
  border: 2px solid cyan;
  border-radius: 10px;
  color: #00fff7;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s;

  &:hover {
    background: cyan;
    color: black;
    text-shadow: 0 0 5px black;
  }

  @media (max-width: 640px) {
    font-size: 1rem;
    padding: 1rem;
  }
`;

const Info = styled.ul`
  list-style: none;
  margin-top: 2rem;
  font-size: 1rem;
  line-height: 2;

  @media (max-width: 640px) {
    font-size: 0.9rem;
  }
`;

const Footer = styled.div`
  margin-top: 3rem;
  border-top: 2px solid cyan;
  padding-top: 1rem;
  font-size: 1rem;
  color: #00d0d0;

  @media (max-width: 640px) {
    font-size: 0.9rem;
  }
`;

function shortenAddress(address: string): string {
    return address.slice(0, 4) + '...' + address.slice(-4);
}

const Home: React.FC = () => {
    const { publicKey } = useWallet();
    const { setVisible } = useWalletModal();

    return (
        <Page>
            <Header>
                <Title>🛸 TRENCHID</Title>
                {publicKey ? (
                    <WalletAddress>{shortenAddress(publicKey.toBase58())}</WalletAddress>
                ) : (
                    <WalletButton onClick={() => setVisible(true)}>Connect Wallet</WalletButton>
                )}
            </Header>

            <Banner>░▒▓▌ SOLANA IDENTITY EXPLORER ▐▓▒░</Banner>

            <Buttons>
                <NavButton to="/resume">📝 Create Resume</NavButton>
                <NavButton to="/leaderboard">🏆 View Leaderboard</NavButton>
                <NavButton to="/explorer">🧠 Explore Wallets</NavButton>
                <NavButton to="/socialgraph">📡 Social Graph</NavButton>
            </Buttons>

            <Info>
                <li>• Build your onchain identity</li>
                <li>• Visualize wallet activity & connections</li>
                <li>• Boost score with wallet transparency</li>
            </Info>

            <Footer>Made for Solana trenchers</Footer>
        </Page>
    );
};

export default Home;
