import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Menu.css';

interface MenuProps {
  walletConnected: boolean;
  walletAddress: string | null;
  networkType: string;
  onLogout: () => void;
}

const Menu: React.FC<MenuProps> = ({
  walletConnected,
  walletAddress,
  networkType,
  onLogout
}) => {
  const navigate = useNavigate();

  return (
    <div className="menu-container">
      <div className="menu-content">
        <h1 className="menu-title">Game Menu</h1>
        
        {walletConnected && (
          <div className="menu-section">
            <div className="wallet-info">
              <p className="network-type">{networkType}</p>
              <p className="wallet-address">
                {walletAddress && `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
              </p>
            </div>
            
            <div className="menu-options">
              <button className="menu-button play" onClick={() => navigate('/game')}>
                Continue Game
              </button>
              <button className="menu-button shop">
                Ship Shop
              </button>
              <button className="menu-button leaderboard">
                Leaderboard
              </button>
              <button className="menu-button settings">
                Settings
              </button>
              <button className="menu-button logout" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
