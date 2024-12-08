import React from 'react';
import WalletConnect from './WalletConnect';
import '../styles/ConnectPage.css';

interface ConnectPageProps {
  onWalletConnected: (address: string, network: string) => void;
  onPlayAsGuest: () => void;
}

const ConnectPage: React.FC<ConnectPageProps> = ({ onWalletConnected, onPlayAsGuest }) => {
  return (
    <div className="connect-container">
      <div className="connect-content">
        <h1 className="connect-title">Connect Your Wallet</h1>
        <p className="connect-description">
          Connect your Bitcoin wallet to start playing and earning rewards, or play as a guest to try the game.
        </p>
        <div className="connection-options">
          <WalletConnect onWalletConnected={onWalletConnected} />
          <div className="guest-option">
            <p>or</p>
            <button className="guest-button" onClick={onPlayAsGuest}>
              Play as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectPage;
