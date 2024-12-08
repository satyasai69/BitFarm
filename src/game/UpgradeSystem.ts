import Phaser from 'phaser';
import { DialogueBox } from './DialogueSystem';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  currentLevel: number;
  effect: (level: number) => number;
}

export class UpgradeMenu extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private upgrades: Upgrade[];
  private buttons: Phaser.GameObjects.Container[];
  private dialogueBox: DialogueBox;
  private isOpen: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.upgrades = [
      {
        id: 'fireRate',
        name: 'Rapid Fire',
        description: 'Increase firing speed',
        cost: 500,
        maxLevel: 10,
        currentLevel: 1,
        effect: (level) => 1 + (level * 0.1)
      },
      {
        id: 'damage',
        name: 'Power Shot',
        description: 'Increase bullet damage',
        cost: 750,
        maxLevel: 10,
        currentLevel: 1,
        effect: (level) => 1 + (level * 0.2)
      },
      {
        id: 'speed',
        name: 'Swift Movement',
        description: 'Increase ship speed',
        cost: 400,
        maxLevel: 10,
        currentLevel: 1,
        effect: (level) => 1 + (level * 0.15)
      },
      {
        id: 'shield',
        name: 'Energy Shield',
        description: 'Add protective shield',
        cost: 1000,
        maxLevel: 5,
        currentLevel: 0,
        effect: (level) => level
      },
      {
        id: 'multishot',
        name: 'Multi Shot',
        description: 'Fire multiple bullets',
        cost: 2000,
        maxLevel: 3,
        currentLevel: 0,
        effect: (level) => 1 + level
      }
    ];

    // Create background
    this.background = scene.add.rectangle(0, 0, 800, 600, 0x000000, 0.9)
      .setStrokeStyle(2, 0x00ff00);
    
    this.add(this.background);
    
    // Create dialogue box for upgrade descriptions
    this.dialogueBox = new DialogueBox(scene, 0, 250);
    this.add(this.dialogueBox);

    // Create buttons
    this.buttons = [];
    this.createUpgradeButtons();

    scene.add.existing(this);
    this.setDepth(100);
    this.setVisible(false);
  }

  private createUpgradeButtons() {
    this.upgrades.forEach((upgrade, index) => {
      const y = -200 + (index * 80);
      
      const button = new Phaser.GameObjects.Container(this.scene, 0, y);
      
      // Button background
      const bg = this.scene.add.rectangle(0, 0, 600, 60, 0x333333)
        .setStrokeStyle(1, 0x00ff00)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          bg.setFillStyle(0x444444);
          this.showUpgradeDescription(upgrade);
        })
        .on('pointerout', () => {
          bg.setFillStyle(0x333333);
        })
        .on('pointerdown', () => {
          this.purchaseUpgrade(upgrade);
        });

      // Upgrade info
      const nameText = this.scene.add.text(-280, -15, upgrade.name, {
        fontSize: '24px',
        color: '#ffffff'
      });

      const levelText = this.scene.add.text(180, -15, `Level: ${upgrade.currentLevel}/${upgrade.maxLevel}`, {
        fontSize: '20px',
        color: '#00ff00'
      });

      const costText = this.scene.add.text(180, 10, `Cost: ${upgrade.cost}`, {
        fontSize: '16px',
        color: '#ffff00'
      });

      button.add([bg, nameText, levelText, costText]);
      this.add(button);
      this.buttons.push(button);
    });
  }

  private showUpgradeDescription(upgrade: Upgrade) {
    this.dialogueBox.showDialogue({
      text: upgrade.description,
      style: 'upgrade',
      duration: 3000
    });
  }

  private purchaseUpgrade(upgrade: Upgrade) {
    if (upgrade.currentLevel >= upgrade.maxLevel) {
      this.dialogueBox.showDialogue({
        text: 'Maximum level reached!',
        style: 'upgrade',
        duration: 2000
      });
      return;
    }

    // TODO: Check player's score/currency
    upgrade.currentLevel++;
    this.updateButtonDisplay();

    // Show success message
    this.dialogueBox.showDialogue({
      text: `Upgraded ${upgrade.name} to level ${upgrade.currentLevel}!`,
      style: 'upgrade',
      duration: 2000
    });

    // Emit upgrade event
    this.scene.events.emit('upgradeSelected', {
      type: upgrade.id,
      level: upgrade.currentLevel,
      effect: upgrade.effect(upgrade.currentLevel)
    });
  }

  private updateButtonDisplay() {
    this.buttons.forEach((button, index) => {
      const upgrade = this.upgrades[index];
      const levelText = button.list[2] as Phaser.GameObjects.Text;
      const costText = button.list[3] as Phaser.GameObjects.Text;
      
      levelText.setText(`Level: ${upgrade.currentLevel}/${upgrade.maxLevel}`);
      costText.setText(`Cost: ${upgrade.cost * upgrade.currentLevel}`);
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.setVisible(this.isOpen);

    if (this.isOpen) {
      this.setScale(0);
      this.scene.tweens.add({
        targets: this,
        scale: 1,
        duration: 300,
        ease: 'Back.out'
      });
    }
  }
}
