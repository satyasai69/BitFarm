import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config';
import { useUnisat } from '../hooks/useUnisat';
import '../styles/GameComponent.css';

const GameComponent: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const { wallet } = useUnisat();

  useEffect(() => {
    if (!wallet.connected) return;

    // Initialize the game
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game({
        ...gameConfig,
        parent: 'game-container',
      });
    }

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [wallet.connected]);

  if (!wallet.connected) {
    return (
      <div className="game-placeholder">
        <h2>Connect your wallet to play!</h2>
      </div>
    );
  }

  return (
    <div className="game-wrapper">
      <div id="game-container" />
      <div className="game-ui">
        <div className="wallet-info">
          <p>Connected: {wallet.accounts?.[0] || 'Not Connected'}</p>
          <p>Balance: {wallet.balance?.confirmed || 0} sats</p>
        </div>
      </div>
    </div>
  );
};

export default GameComponent;
