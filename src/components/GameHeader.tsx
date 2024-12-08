import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GameHeader.css';

interface GameHeaderProps {
  walletConnected: boolean;
  walletAddress: string | null;
  networkType: string;
  onProfileClick: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  walletConnected,
  walletAddress,
  networkType,
  onProfileClick
}) => {
  const navigate = useNavigate();

  return (
    <div className="game-header">
      <button className="menu-button" onClick={() => navigate('/connect')}>
        Back to Menu
      </button>
      {walletConnected && (
        <div className="wallet-status" onClick={onProfileClick}>
          <span className="network-badge">{networkType}</span>
          <span className="address-text">
            {walletAddress && `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default GameHeader;
