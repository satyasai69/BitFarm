import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import ConnectPage from './components/ConnectPage';
import Menu from './components/Menu';
import GameHeader from './components/GameHeader';
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
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/connect" 
            element={
              !walletConnected ? (
                <ConnectPage 
                  onWalletConnected={handleWalletConnected}
                  onPlayAsGuest={handlePlayAsGuest}
                />
              ) : (
                <Menu 
                  walletConnected={walletConnected}
                  walletAddress={walletAddress}
                  networkType={networkType}
                  onLogout={handleLogout}
                />
              )
            } 
          />
          <Route
            path="/game"
            element={
              walletConnected || isGuest ? (
                <>
                  <GameHeader 
                    walletConnected={walletConnected}
                    walletAddress={walletAddress}
                    networkType={networkType}
                    onProfileClick={() => setShowProfile(true)}
                  />
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
              ) : (
                <Navigate to="/connect" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
