import Phaser from 'phaser';

export default class WalletScene extends Phaser.Scene {
    private connectButton!: Phaser.GameObjects.DOMElement;
    private walletStatus!: Phaser.GameObjects.Text;
    private loadingText!: Phaser.GameObjects.Text;
    private isConnecting: boolean = false;

    constructor() {
        super({ key: 'WalletScene' });
    }

    create() {
        // Create a stylish background
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0x000000, 0x000000, 0x1a1a1a, 0x1a1a1a, 1);
        gradient.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        // Add Bitcoin logo or game title
        const title = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height * 0.3,
            'Bitcoin Space Shooter',
            {
                fontSize: '48px',
                color: '#f7931a',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Create a DOM element for the connect button
        const button = document.createElement('button');
        button.textContent = 'Connect Unisat Wallet';
        button.style.padding = '15px 30px';
        button.style.fontSize = '18px';
        button.style.backgroundColor = '#f7931a';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '8px';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.3s ease';

        button.onmouseover = () => {
            button.style.transform = 'scale(1.05)';
            button.style.backgroundColor = '#e68a17';
        };
        button.onmouseout = () => {
            button.style.transform = 'scale(1)';
            button.style.backgroundColor = '#f7931a';
        };

        this.connectButton = this.add.dom(
            this.cameras.main.centerX,
            this.cameras.main.height * 0.5,
            button
        ).setOrigin(0.5);

        // Add wallet status text
        this.walletStatus = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height * 0.6,
            '',
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Add loading text (hidden initially)
        this.loadingText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height * 0.7,
            'Connecting...',
            {
                fontSize: '24px',
                color: '#f7931a'
            }
        ).setOrigin(0.5).setVisible(false);

        // Add event listener for the connect button
        button.onclick = async () => {
            if (this.isConnecting) return;
            this.isConnecting = true;
            
            this.loadingText.setVisible(true);
            this.connectButton.setVisible(false);

            try {
                if (typeof window.unisat === 'undefined') {
                    throw new Error('Unisat wallet is not installed!');
                }

                const accounts = await window.unisat.requestAccounts();
                
                if (accounts && accounts.length > 0) {
                    const address = accounts[0];
                    this.walletStatus.setText(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
                    
                    // Store the wallet address in game data
                    this.registry.set('walletAddress', address);
                    
                    // Wait a moment to show the success message
                    this.time.delayedCall(1500, () => {
                        this.scene.start('PreloadScene');
                    });
                }
            } catch (error) {
                console.error('Wallet connection error:', error);
                this.walletStatus.setText('Failed to connect wallet. Please try again.');
                this.connectButton.setVisible(true);
                this.isConnecting = false;
            }

            this.loadingText.setVisible(false);
        };

        // Make the scene responsive
        this.scale.on('resize', this.resize, this);
        this.resize();
    }

    resize() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.resize(width, height);

        // Update positions of elements
        if (this.connectButton) {
            this.connectButton.setPosition(width / 2, height * 0.5);
        }
        if (this.walletStatus) {
            this.walletStatus.setPosition(width / 2, height * 0.6);
        }
        if (this.loadingText) {
            this.loadingText.setPosition(width / 2, height * 0.7);
        }
    }
}
