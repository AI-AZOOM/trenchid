import React from 'react';
import styled from 'styled-components';

const Status = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0,255,255,0.1);
  border-radius: 8px;
  font-family: 'Orbitron', monospace;
`;

type WalletStatusProps = {
    address: string;
};

const WalletStatus: React.FC<WalletStatusProps> = ({ address }) => {
    return <Status>Wallet connected: {address}</Status>;
};

export default WalletStatus;
