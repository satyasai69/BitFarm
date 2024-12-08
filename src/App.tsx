import React, { useState, useEffect } from 'react';
import './App.css';
import WalletConnect from './components/WalletConnect';
import WalletProfile from './components/WalletProfile';
import Game from './components/Game';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [networkType, setNetworkType] = useState<string>('');
  const [isGuest, setIsGuest] = useState(false);

  // Effect to check stored wallet connection on mount
  useEffect(() => {
    const checkStoredConnection = async () => {
      const storedConnected = localStorage.getItem('walletConnected');
      const storedAddress = localStorage.getItem('walletAddress');
      const storedNetwork = localStorage.getItem('walletNetwork');

      if (storedConnected === 'true' && storedAddress && storedNetwork) {
        try {
          // Verify the connection is still valid
          const accounts = await window.unisat?.getAccounts();
          if (accounts && accounts[0] === storedAddress) {
            setWalletAddress(storedAddress);
            setNetworkType(storedNetwork);
            setWalletConnected(true);
          } else {
            // Clear invalid stored data
            handleLogout();
          }
        } catch (err) {
          // Clear stored data on error
          handleLogout();
        }
      }
    };

    checkStoredConnection();
  }, []);

  const handleWalletConnected = (address: string, network: string) => {
    setWalletAddress(address);
    setNetworkType(network);
    setWalletConnected(true);
    setIsGuest(false);
  };

  const handleLogout = () => {
    // Clear all states
    setWalletAddress(null);
    setWalletConnected(false);
    setShowProfile(false);
    setNetworkType('');
    setIsGuest(false);

    // Clear local storage
    localStorage.clear();

    // Disconnect from Unisat
    if (window.unisat) {
      window.unisat.disconnect().catch(console.error);
    }
  };

  const handlePlayAsGuest = () => {
    setIsGuest(true);
    setWalletConnected(false);
    setWalletAddress(null);
    setNetworkType('');
    localStorage.clear();
  };

  return (
    <div className="app-container">
      {!walletConnected && !isGuest ? (
        <div className="wallet-screen">
          <h1 className="game-title">Bitcoin Space Shooter</h1>
          <div className="connection-options">
            <WalletConnect onWalletConnected={handleWalletConnected} />
            <div className="guest-option">
              <p>or</p>
              <button className="guest-button" onClick={handlePlayAsGuest}>
                Play as Guest
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {walletConnected && (
            <div 
              className="wallet-status"
              onClick={() => setShowProfile(true)}
            >
              <span className="network-badge">{networkType}</span>
              <span className="address-text">
                {walletAddress && `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
              </span>
            </div>
          )}
          {showProfile && walletAddress && (
            <WalletProfile
              address={walletAddress}
              network={networkType}
              onClose={() => setShowProfile(false)}
              onLogout={handleLogout}
              isOpen={showProfile}
            />
          )}
          <Game walletAddress={walletAddress} isGuest={isGuest} />
        </>
      )}
    </div>
  );
}

export default App;
