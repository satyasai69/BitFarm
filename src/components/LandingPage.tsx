import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Bitcoin Space Shooter</h1>
        <p className="landing-description">
          Embark on an epic space adventure powered by Bitcoin. Connect your wallet, upgrade your ship, and conquer the cosmos!
        </p>
        <div className="feature-grid">
          <div className="feature-item">
            <h3>🚀 Epic Space Battles</h3>
            <p>Engage in intense space combat with various enemy types</p>
          </div>
          <div className="feature-item">
            <h3>💰 Bitcoin Integration</h3>
            <p>Use Bitcoin to upgrade your ships and unlock special features</p>
          </div>
          <div className="feature-item">
            <h3>🛸 Multiple Ships</h3>
            <p>Choose from different ships with unique abilities</p>
          </div>
          <div className="feature-item">
            <h3>🏆 Compete & Earn</h3>
            <p>Climb the leaderboard and earn rewards</p>
          </div>
        </div>
        <button className="get-started-button" onClick={() => navigate('/connect')}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
