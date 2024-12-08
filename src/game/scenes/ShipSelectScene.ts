import Phaser from 'phaser';

interface Ship {
  id: number;
  name: string;
  price: number;
  speed: number;
  fireRate: number;
  color: number;
}

export default class ShipSelectScene extends Phaser.Scene {
  private ships: Ship[] = [
    {
      id: 1,
      name: 'Basic Ship',
      price: 0,
      speed: 1,
      fireRate: 1,
      color: 0x00ff00
    },
    {
      id: 2,
      name: 'Speed Fighter',
      price: 1000,
      speed: 1.5,
      fireRate: 1.2,
      color: 0x00ffff
    },
    {
      id: 3,
      name: 'Heavy Gunner',
      price: 2000,
      speed: 0.8,
      fireRate: 2,
      color: 0xff0000
    }
  ];

  constructor() {
    super({ key: 'ShipSelectScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const isGuest = this.game.registry.get('isGuest');

    this.add.text(width/2, 100, 'Select Your Ship', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Create ship selection cards
    this.ships.forEach((ship, index) => {
      const x = width/2;
      const y = 250 + (index * 120);

      // Ship card background
      const card = this.add.rectangle(x, y, 300, 100, 0x333333)
        .setInteractive()
        .on('pointerdown', () => this.selectShip(ship, isGuest))
        .on('pointerover', () => card.setFillStyle(0x444444))
        .on('pointerout', () => card.setFillStyle(0x333333));

      // Ship preview (colored triangle)
      this.add.triangle(x - 120, y, 0, 20, 20, -20, -20, -20, ship.color);

      // Ship info
      this.add.text(x - 80, y - 20, ship.name, { fontSize: '24px', color: '#ffffff' });
      this.add.text(x - 80, y + 10, `Speed: ${ship.speed}`, { fontSize: '16px', color: '#ffffff' });
      this.add.text(x + 20, y + 10, `Fire Rate: ${ship.fireRate}`, { fontSize: '16px', color: '#ffffff' });
      
      if (ship.price > 0) {
        if (isGuest) {
          // Show locked status for premium ships in guest mode
          this.add.text(x + 50, y - 20, 'LOCKED', { fontSize: '20px', color: '#ff0000' });
          card.setFillStyle(0x222222);
          card.disableInteractive();
        } else {
          this.add.text(x + 50, y - 20, `${ship.price} sats`, { fontSize: '20px', color: '#ffff00' });
        }
      } else {
        this.add.text(x + 50, y - 20, 'FREE', { fontSize: '20px', color: '#00ff00' });
      }
    });

    // Add back button
    const backButton = this.add.text(50, 50, '← Back', {
      fontSize: '24px',
      color: '#ffffff'
    })
    .setInteractive()
    .on('pointerdown', () => this.scene.start('WalletScene'))
    .on('pointerover', () => backButton.setColor('#f7931a'))
    .on('pointerout', () => backButton.setColor('#ffffff'));
  }

  private selectShip(ship: Ship, isGuest: boolean) {
    if (isGuest && ship.price > 0) {
      // Show message that premium ships require wallet connection
      const width = this.scale.width;
      const height = this.scale.height;
      
      const popup = this.add.rectangle(width/2, height/2, 400, 200, 0x000000, 0.8);
      const text = this.add.text(width/2, height/2 - 20, 
        'Premium ships require\nwallet connection!', 
        { fontSize: '24px', color: '#ffffff', align: 'center' }
      ).setOrigin(0.5);
      
      const closeButton = this.add.text(width/2, height/2 + 40, 'OK', 
        { fontSize: '20px', color: '#f7931a' }
      )
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        popup.destroy();
        text.destroy();
        closeButton.destroy();
      });
      
      return;
    }

    this.scene.start('MainScene', { ship });
  }
}
