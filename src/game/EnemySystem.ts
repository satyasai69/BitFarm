import Phaser from 'phaser';

export interface EnemyConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  type: string;
  level: number;
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private movePattern!: Phaser.Tweens.Tween;
  private health: number;
  private maxHealth: number;
  private healthBar?: Phaser.GameObjects.Graphics;
  private enemyType: string;
  private isBoss: boolean;

  constructor(config: EnemyConfig) {
    super(config.scene, config.x, config.y, config.type);
    
    this.enemyType = config.type;
    this.isBoss = config.type.includes('boss');
    this.maxHealth = this.isBoss ? 100 * config.level : 10 * config.level;
    this.health = this.maxHealth;

    // Add to scene and enable physics
    config.scene.add.existing(this);
    config.scene.physics.add.existing(this);

    // Setup animations
    this.setupAnimations();
    
    // Create health bar for bosses
    if (this.isBoss) {
      this.createHealthBar();
    }

    // Set random movement pattern
    this.setRandomMovement();
  }

  private setupAnimations() {
    // Add idle animation
    this.play(`${this.enemyType}_idle`);
    
    // Add floating effect
    this.scene.tweens.add({
      targets: this,
      y: '+=10',
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private createHealthBar() {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }

  private updateHealthBar() {
    if (!this.healthBar) return;

    this.healthBar.clear();
    
    // Background
    this.healthBar.fillStyle(0x000000, 0.8);
    this.healthBar.fillRect(this.x - 30, this.y - 40, 60, 6);
    
    // Health
    const healthPercentage = this.health / this.maxHealth;
    const color = healthPercentage > 0.5 ? 0x00ff00 : healthPercentage > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(this.x - 30, this.y - 40, 60 * healthPercentage, 6);
  }

  setRandomMovement() {
    const patterns = [
      this.zigzagPattern.bind(this),
      this.circularPattern.bind(this),
      this.swoopPattern.bind(this)
    ];
    
    const selectedPattern = Phaser.Math.RND.pick(patterns);
    selectedPattern();
  }

  private zigzagPattern() {
    const width = this.scene.scale.width;
    const startX = this.x;
    
    this.movePattern = this.scene.tweens.add({
      targets: this,
      x: [
        startX - 100,
        startX + 100,
        startX - 100,
        startX + 100
      ],
      y: '+=400',
      duration: 3000,
      ease: 'Sine.inOut'
    });
  }

  private circularPattern() {
    const centerX = this.x;
    const radius = 100;
    let angle = 0;
    
    this.movePattern = this.scene.tweens.add({
      targets: this,
      y: '+=300',
      duration: 3000,
      onUpdate: () => {
        angle += 0.05;
        this.x = centerX + Math.sin(angle) * radius;
      }
    });
  }

  private swoopPattern() {
    const startX = this.x;
    const controlPoint1X = startX - 200;
    const controlPoint2X = startX + 200;
    
    this.movePattern = this.scene.tweens.add({
      targets: this,
      x: [
        startX,
        controlPoint1X,
        controlPoint2X,
        startX
      ],
      y: '+=400',
      duration: 2000,
      ease: 'Cubic.inOut'
    });
  }

  takeDamage(damage: number) {
    this.health -= damage;
    
    if (this.isBoss) {
      this.updateHealthBar();
    }

    // Flash effect
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  destroy(fromScene?: boolean) {
    if (this.movePattern) {
      this.movePattern.stop();
    }
    if (this.healthBar) {
      this.healthBar.destroy();
    }
    super.destroy(fromScene);
  }
}
