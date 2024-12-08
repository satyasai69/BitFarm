import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import config from '../game/config';

interface GameProps {
    walletAddress: string | null;
    isGuest: boolean;
}

const Game: React.FC<GameProps> = ({ walletAddress, isGuest }) => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        // Create container div if it doesn't exist
        let container = document.getElementById('game-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'game-container';
            document.body.appendChild(container);
        }

        // Initialize game with config
        const gameConfig = {
            ...config,
            callbacks: {
                preBoot: (game: Phaser.Game) => {
                    // Add wallet or guest info to game registry
                    game.registry.set('isGuest', isGuest);
                    game.registry.set('walletAddress', walletAddress || '');
                }
            }
        };

        // Create new game instance
        gameRef.current = new Phaser.Game(gameConfig);

        // Cleanup function
        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
            if (container) {
                container.remove();
            }
        };
    }, [walletAddress, isGuest]);

    return null; // The game container is managed by Phaser
};

export default Game;
