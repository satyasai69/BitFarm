import Phaser from 'phaser';
import WalletScene from './scenes/WalletScene';
import ShipSelectScene from './scenes/ShipSelectScene';
import MainScene from './scenes/MainScene';
import PreloadScene from './scenes/PreloadScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    backgroundColor: '#000000',
    scene: [PreloadScene, WalletScene, ShipSelectScene, MainScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

export default config;
