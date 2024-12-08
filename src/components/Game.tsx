import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import config from '../game/config';

interface GameProps {
    walletAddress: string | null;
    isGuest: boolean;
}

const Game: React.FC<GameProps> = ({ walletAddress, isGuest }) => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Wait for container to be available
        if (!containerRef.current) return;

        // Initialize game with config
        const gameConfig = {
            ...config,
            parent: containerRef.current,
            callbacks: {
                preBoot: (game: Phaser.Game) => {
                    // Add wallet or guest info to game registry
                    game.registry.set('isGuest', isGuest);
                    game.registry.set('walletAddress', walletAddress || '');
                }
            },
            audio: {
                disableWebAudio: true // Use HTML5 Audio instead of WebAudio
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
        };
    }, [walletAddress, isGuest]);

    return <div ref={containerRef} className="game-container" />;
};

export default Game;
