import Phaser from 'phaser';

interface Shop {
    gameObject: Phaser.GameObjects.Sprite;
    type: 'merchant' | 'land_shop' | 'item_shop' | 'exchange';
    name: string;
}

interface Land {
    gameObject: Phaser.GameObjects.Sprite;
    owner: string;
    growthStage: number;
    lastUpdate: number;
    hasCollectible: boolean;
    type: 'tree' | 'crop';
}

interface DialogOption {
    text: string;
    callback: () => void;
}

export default class MainScene extends Phaser.Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private shops: Shop[] = [];
    private lands: Map<string, Land> = new Map();
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    private coins: number = 0;
    private coinsText!: Phaser.GameObjects.Text;
    private dialogBox!: Phaser.GameObjects.Container;
    private selectedLand: Land | null = null;
    private placementMode: boolean = false;
    private timer!: Phaser.GameObjects.Text;
    private gameTime: number = 0;
    private worldSize = { width: 3000, height: 3000 };
    private decorations: Phaser.GameObjects.Sprite[] = [];

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Load terrain assets
        this.load.image('grass', '/assets/tiles/grass.png');
        this.load.image('grass1', '/assets/Ground tileset/Bright-grass-tileset.png');
        this.load.image('grass2', '/assets/Ground tileset/Dark-grass-tileset.png');
        this.load.image('dirt', '/assets/Ground tileset/Earth-tileset.png');
        this.load.image('path-h', '/assets/Ground tileset/Stone-path-tileset-horizontal.png');
        this.load.image('path-v', '/assets/Ground tileset/Stone-path-tileset-vertical.png');

        // Load nature assets
        this.load.image('tree1', '/assets/Trees/Tree-1.png');
        this.load.image('tree2', '/assets/Trees/Tree-2.png');
        this.load.image('tree3', '/assets/Trees/Tree-3.png');

        // Load bushes
        this.load.image('bush1', '/assets/Bushes/Bush-1.png');
        this.load.image('bush2', '/assets/Bushes/Bush-2.png');
        this.load.image('bush3', '/assets/Bushes/Bush-3.png');

        // Load flowers
        this.load.image('flower1', '/assets/Flowers/Flower-1.png');
        this.load.image('flower2', '/assets/Flowers/Flower-2.png');
        this.load.image('flower3', '/assets/Flowers/Flower-3.png');

        // Load fences
        this.load.image('fence-h', '/assets/Fences/Wooden-fence-1.png');
        this.load.image('fence-v', '/assets/Fences/Wooden-fence-2.png');
        this.load.image('fence-corner', '/assets/Fences/Wooden-fence-3.png');
        this.load.image('fence-gate', '/assets/Fences/Wooden-gate.png');

        // Load objects
        this.load.image('bench', '/assets/Bench and chest/Wooden-bench.png');
        this.load.image('chest', '/assets/Bench and chest/Wooden-chest.png');

        // Load character assets
        this.load.spritesheet('character', '/assets/Sunnyside_World_Assets/characters/base_character.png', 
            { frameWidth: 48, frameHeight: 48 });
        
        // Load farming assets
        this.load.spritesheet('crops', 'assets/Sunnyside_World_Assets/farming/crops.png',
            { frameWidth: 32, frameHeight: 32 });
        
        // Load tiles
        this.load.image('tiles', 'assets/Sunnyside_World_Assets/tilesets/farming_tiles.png');

        // Load UI elements
        this.load.image('button', '/assets/Objects/button.png');
        this.load.image('panel', '/assets/Objects/panel.png');
    }

    create() {
        // Create the world
        const grass = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'grass');
        grass.setOrigin(0, 0);
        grass.setScrollFactor(0);

        // Setup controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D') as any;

        // Create player
        this.player = this.physics.add.sprite(400, 300, 'character');
        this.player.setCollideWorldBounds(true);
        
        // Create player animations
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        // Set up camera to follow player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);

        // Create environment
        this.createEnvironment();
        
        // Create buildings
        this.createBuildings();
        
        // Create UI
        this.createUI();
        
        // Start game timer
        this.startGameTimer();
    }

    private createEnvironment() {
        // Add trees in a more organized pattern
        const treePositions = [
            { x: -150, y: -150 }, { x: 150, y: -150 },
            { x: -150, y: 150 }, { x: 150, y: 150 }
        ];

        treePositions.forEach(pos => {
            const treeType = Phaser.Math.Between(1, 3);
            const tree = this.add.image(pos.x, pos.y, `tree${treeType}`);
            tree.setScale(1);
        });

        // Add bushes and flowers along the paths
        for (let x = -180; x <= 180; x += 60) {
            const type = Math.random() > 0.5 ? 'bush' : 'flower';
            const variant = Phaser.Math.Between(1, 3);
            const decoration = this.add.image(x, 50, `${type}${variant}`);
            decoration.setScale(0.8);
        }
    }

    private createBuildings() {
        // Create a fenced area
        this.createFencedArea(100, 100, 160, 120);
        
        // Add some benches and chests
        this.add.image(50, 50, 'bench').setScale(1);
        this.add.image(-50, -50, 'chest').setScale(1);
    }

    private createFencedArea(x: number, y: number, width: number, height: number) {
        const fenceSize = 32; 
        
        // Create horizontal fences
        for (let fx = 0; fx < width; fx += fenceSize) {
            this.add.image(x + fx, y, 'fence-h').setScale(1);
            this.add.image(x + fx, y + height, 'fence-h').setScale(1);
        }
        
        // Create vertical fences
        for (let fy = 0; fy < height; fy += fenceSize) {
            this.add.image(x, y + fy, 'fence-v').setScale(1);
            this.add.image(x + width, y + fy, 'fence-v').setScale(1);
        }
        
        // Add corners
        this.add.image(x, y, 'fence-corner').setScale(1);
        this.add.image(x + width, y, 'fence-corner').setScale(1);
        this.add.image(x, y + height, 'fence-corner').setScale(1);
        this.add.image(x + width, y + height, 'fence-corner').setScale(1);
        
        // Add a gate
        this.add.image(x + width/2, y, 'fence-gate').setScale(1);
    }

    private createUI() {
        // Create coins display
        this.coinsText = this.add.text(16, 16, `Coins: ${this.coins}`, {
            fontSize: '24px',
            color: '#000000'
        }).setScrollFactor(0);

        // Create timer
        this.timer = this.add.text(16, 48, 'Time: 00:00', {
            fontSize: '24px',
            color: '#000000'
        }).setScrollFactor(0);

        // Create dialog box (hidden by default)
        this.createDialogBox();
    }

    private createDialogBox() {
        this.dialogBox = this.add.container(0, 0);
        this.dialogBox.setScrollFactor(0);
        this.dialogBox.setDepth(1000);
        this.hideDialog();
    }

    private showDialog(title: string, options: DialogOption[]) {
        this.dialogBox.removeAll(true);
        
        const width = 300;
        const height = 200;
        const x = this.scale.width/2 - width/2;
        const y = this.scale.height/2 - height/2;

        // Background
        const bg = this.add.rectangle(x, y, width, height, 0xFFFFFF);
        bg.setOrigin(0);
        bg.setStrokeStyle(2, 0x000000);
        
        // Title
        const titleText = this.add.text(x + width/2, y + 20, title, {
            fontSize: '20px',
            color: '#000000'
        }).setOrigin(0.5);

        // Options
        options.forEach((option, index) => {
            const button = this.add.rectangle(x + width/2, y + 80 + (index * 40), 200, 30, 0xDDDDDD);
            button.setInteractive();
            button.on('pointerdown', () => {
                option.callback();
                this.hideDialog();
            });

            const text = this.add.text(x + width/2, y + 80 + (index * 40), option.text, {
                fontSize: '16px',
                color: '#000000'
            }).setOrigin(0.5);

            this.dialogBox.add([button, text]);
        });

        this.dialogBox.add([bg, titleText]);
        this.dialogBox.setVisible(true);
    }

    private hideDialog() {
        this.dialogBox.setVisible(false);
    }

    private startGameTimer() {
        this.time.addEvent({
            delay: 1000,
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true
        });
    }

    private updateGameTime() {
        this.gameTime++;
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        this.timer.setText(`Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }

    update() {
        if (!this.player || this.placementMode) return;

        // Handle movement
        const speed = 160;
        
        // Reset velocity
        this.player.setVelocity(0);
        
        // Horizontal movement
        if (this.wasdKeys.A.isDown || this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.flipX = true;
        }
        else if (this.wasdKeys.D.isDown || this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.flipX = false;
        }
        
        // Vertical movement
        if (this.wasdKeys.W.isDown || this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        }
        else if (this.wasdKeys.S.isDown || this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }
        
        // Play animations
        if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
            this.player.anims.play('walk', true);
        } else {
            this.player.anims.play('idle', true);
        }

        // Check for shop interactions
        this.checkShopInteractions();
    }
}
