import Phaser from 'phaser';

interface Shop {
    gameObject: Phaser.GameObjects.Rectangle;
    type: 'merchant' | 'land_shop' | 'item_shop' | 'exchange';
    name: string;
}

interface Land {
    gameObject: Phaser.GameObjects.Rectangle;
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
    private player!: Phaser.GameObjects.Rectangle;
    private shops: Shop[] = [];
    private lands: Map<string, Land> = new Map();
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private coins: number = 0;
    private coinsText!: Phaser.GameObjects.Text;
    private dialogBox!: Phaser.GameObjects.Container;
    private selectedLand: Land | null = null;
    private placementMode: boolean = false;
    private timer!: Phaser.GameObjects.Text;
    private gameTime: number = 0;
    private worldSize = { width: 2000, height: 2000 };

    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        // Create grass background
        this.createBackground();
        
        // Setup world bounds
        this.physics.world.setBounds(-this.worldSize.width/2, -this.worldSize.height/2, 
                                    this.worldSize.width, this.worldSize.height);
        
        // Create shops in four corners
        this.createShops();
        
        // Create player
        this.player = this.add.rectangle(0, 0, 32, 32, 0xFF69B4);
        this.physics.add.existing(this.player);
        (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        
        // Setup camera
        this.cameras.main.setBounds(-this.worldSize.width/2, -this.worldSize.height/2, 
                                   this.worldSize.width, this.worldSize.height);
        this.cameras.main.startFollow(this.player);
        
        // Setup UI
        this.createUI();
        
        // Setup controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-ESC', () => this.cancelPlacement());
        
        // Start game timer
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Start growth cycle
        this.time.addEvent({
            delay: 5000,
            callback: this.updateGrowth,
            callbackScope: this,
            loop: true
        });
    }

    private createBackground() {
        const tileSize = 64;
        for (let x = -this.worldSize.width/2; x < this.worldSize.width/2; x += tileSize) {
            for (let y = -this.worldSize.height/2; y < this.worldSize.height/2; y += tileSize) {
                this.add.rectangle(x, y, tileSize, tileSize, 0x90EE90);
            }
        }
    }

    private createShops() {
        const offset = 400;
        const shops = [
            { x: -offset, y: -offset, type: 'merchant', name: 'Merchant Shop' },
            { x: offset, y: -offset, type: 'land_shop', name: 'Land Shop' },
            { x: -offset, y: offset, type: 'item_shop', name: 'Item Shop' },
            { x: offset, y: offset, type: 'exchange', name: 'Exchange' }
        ];

        shops.forEach(shop => {
            const shopObj = this.add.rectangle(shop.x, shop.y, 128, 128, 0x8B4513);
            shopObj.setInteractive();
            shopObj.on('pointerdown', () => this.handleShopInteraction(shop.type));
            this.shops.push({
                gameObject: shopObj,
                type: shop.type as any,
                name: shop.name
            });
            
            // Add shop name
            this.add.text(shop.x, shop.y - 80, shop.name, {
                fontSize: '16px',
                color: '#000000'
            }).setOrigin(0.5);
        });
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

    private handleShopInteraction(shopType: string) {
        const shop = this.shops.find(s => s.type === shopType);
        if (!shop) return;

        const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            shop.gameObject.x,
            shop.gameObject.y
        );

        if (distance > 150) return;

        switch(shopType) {
            case 'land_shop':
                this.showDialog('Land Shop', [
                    { text: 'Buy Land (100 coins)', callback: () => this.buyLand() },
                    { text: 'Cancel', callback: () => this.hideDialog() }
                ]);
                break;
            case 'merchant':
                this.showDialog('Merchant', [
                    { text: 'Buy Seeds (50 coins)', callback: () => this.buySeeds() },
                    { text: 'Sell Produce', callback: () => this.sellProduce() }
                ]);
                break;
            case 'exchange':
                this.showDialog('Exchange', [
                    { text: 'Convert to BRC-20', callback: () => this.convertToBRC20() },
                    { text: 'Cancel', callback: () => this.hideDialog() }
                ]);
                break;
        }
    }

    private buyLand() {
        if (this.coins < 100) {
            this.showDialog('Error', [
                { text: 'Not enough coins!', callback: () => this.hideDialog() }
            ]);
            return;
        }

        this.coins -= 100;
        this.coinsText.setText(`Coins: ${this.coins}`);
        this.placementMode = true;
        this.selectedLand = {
            gameObject: this.add.rectangle(0, 0, 64, 64, 0x8B4513),
            owner: 'player',
            growthStage: 0,
            lastUpdate: Date.now(),
            hasCollectible: false,
            type: 'tree'
        };
        this.selectedLand.gameObject.setAlpha(0.5);
    }

    private buySeeds() {
        // Implement seed buying logic
        console.log('Buying seeds...');
    }

    private sellProduce() {
        // Implement produce selling logic
        console.log('Selling produce...');
    }

    private placeLand(x: number, y: number) {
        if (!this.selectedLand) return;
        
        const landId = `land_${Date.now()}`;
        this.selectedLand.gameObject.setPosition(x, y);
        this.selectedLand.gameObject.setAlpha(1);
        this.lands.set(landId, this.selectedLand);
        
        this.selectedLand.gameObject.setInteractive();
        this.selectedLand.gameObject.on('pointerdown', () => this.handleLandInteraction(landId));
        
        this.placementMode = false;
        this.selectedLand = null;
    }

    private cancelPlacement() {
        if (this.selectedLand) {
            this.selectedLand.gameObject.destroy();
            this.selectedLand = null;
            this.placementMode = false;
            this.coins += 100; // Refund
            this.coinsText.setText(`Coins: ${this.coins}`);
        }
    }

    private handleLandInteraction(landId: string) {
        const land = this.lands.get(landId);
        if (!land) return;

        if (land.hasCollectible) {
            this.collectProduce(land);
        }
    }

    private collectProduce(land: Land) {
        if (!land.hasCollectible) return;
        
        const reward = Math.floor(Math.random() * 20) + 10;
        this.coins += reward;
        this.coinsText.setText(`Coins: ${this.coins}`);
        
        land.hasCollectible = false;
        land.growthStage = 0;
        land.gameObject.setFillStyle(0x8B4513);
    }

    private updateGrowth() {
        this.lands.forEach(land => {
            if (land.growthStage < 5 && !land.hasCollectible) {
                land.growthStage++;
                const green = Math.min(50 + (land.growthStage * 40), 255);
                land.gameObject.setFillStyle(Phaser.Display.Color.GetColor(0, green, 0));
                
                if (land.growthStage === 5) {
                    land.hasCollectible = true;
                    // Add sparkle effect or indicator
                }
            }
        });
    }

    private updateTimer() {
        this.gameTime++;
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        this.timer.setText(`Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }

    private convertToBRC20() {
        if (this.coins < 1000) {
            this.showDialog('Error', [
                { text: 'Need 1000 coins minimum', callback: () => this.hideDialog() }
            ]);
            return;
        }

        // Here you would integrate with actual BRC-20 conversion
        console.log('Converting coins to BRC-20 tokens...');
    }

    update() {
        if (!this.cursors) return;

        const speed = 5;

        // Handle movement
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);

        if (this.cursors.left.isDown) {
            body.setVelocityX(-speed * 60);
        }
        else if (this.cursors.right.isDown) {
            body.setVelocityX(speed * 60);
        }

        if (this.cursors.up.isDown) {
            body.setVelocityY(-speed * 60);
        }
        else if (this.cursors.down.isDown) {
            body.setVelocityY(speed * 60);
        }

        // Update land placement preview
        if (this.placementMode && this.selectedLand) {
            const pointer = this.input.activePointer;
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.selectedLand.gameObject.setPosition(worldPoint.x, worldPoint.y);
            
            if (pointer.isDown) {
                this.placeLand(worldPoint.x, worldPoint.y);
            }
        }

        // Check for shop proximity and show indicators
        this.shops.forEach(shop => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                shop.gameObject.x,
                shop.gameObject.y
            );
            
            if (distance < 150) {
                shop.gameObject.setStrokeStyle(2, 0xFFFF00);
            } else {
                shop.gameObject.setStrokeStyle(0);
            }
        });
    }
}
