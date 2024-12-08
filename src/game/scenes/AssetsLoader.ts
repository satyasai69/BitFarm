import Phaser from 'phaser';

export default class AssetsLoader extends Phaser.Scene {
    constructor() {
        super({ key: 'AssetsLoader' });
    }

    preload() {
        // Show loading progress
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                color: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        // Loading progress events
        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Load terrain assets
        this.load.image('grass1', '/assets/2d-pixel-art-grass-terrain-tileset--vibrant-green-.png');
        this.load.image('grass2', '/assets/2d-pixel-art-grass-terrain-tileset--vibrant-green- (1).png');
        this.load.image('path', '/assets/2d-pixel-art-cobblestone-path-rpg-game-style--natu.png');
        this.load.image('path-intersection', '/assets/path intersection.png');

        // Load nature assets
        this.load.image('tree1', '/assets/2d-pixel-art-deciduous-tree-with-lush-green-foliag.png');
        this.load.image('tree2', '/assets/tree.png');
        this.load.image('bush1', '/assets/2d-pixel-art-garden-elements--small-bushes--flower.png');
        this.load.image('bush2', '/assets/2d-pixel-art-shrubs-with-lush-green-foliage--detai.png');
        this.load.image('rock', '/assets/2d-pixel-art-small-rocks-and-stones-set--varied-sh.png');
        this.load.image('pond', '/assets/2d-pixel-art-water-pond-with-ripple-effects--light.png');

        // Load building assets
        this.load.image('tavern', '/assets/final tavern.png');
        this.load.image('house', '/assets/house.png');
        this.load.image('hut', '/assets/hut.png');
        this.load.image('farm', '/assets/farm.png');
        this.load.image('barn', '/assets/2d-pixeled-art-storage-barn-with-rough-gray-rock-t.png');

        // Load background assets
        this.load.image('mountains', '/assets/2d-pixel-art-mountain-range-backdrop--layered-peak.png');
        this.load.image('cave', '/assets/2d-pixeled-art-stone-cave-entrance-with-rough-gray.png');

        // Load character sprite sheet
        this.load.spritesheet('character', '/assets/character.png', {
            frameWidth: 48,
            frameHeight: 48
        });
    }

    create() {
        // Create character animations
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('character', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('character', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('character', { start: 12, end: 15 }),
            frameRate: 8,
            repeat: -1
        });

        // Start main scene
        this.scene.start('MainScene');
    }
}
