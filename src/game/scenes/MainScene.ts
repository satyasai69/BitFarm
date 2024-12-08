import Phaser from 'phaser';
import { DialogueBox } from '../DialogueSystem';

interface GameState {
  score: number;
  level: number;
  ship: {
    speed: number;
    fireRate: number;
    color: number;
  };
}

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Triangle;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private lastFired: number = 0;
  private dialogueBox!: DialogueBox;
  private gameState: GameState = {
    score: 0,
    level: 1,
    ship: {
      speed: 1,
      fireRate: 1,
      color: 0x00ff00
    }
  };

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: any) {
    if (data.ship) {
      this.gameState.ship = {
        speed: data.ship.speed,
        fireRate: data.ship.fireRate,
        color: data.ship.color
      };
    }
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Create player
    this.player = this.add.triangle(width/2, height - 100, 0, 20, 20, -20, -20, -20, this.gameState.ship.color);
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    // Create enemy group
    this.enemies = this.physics.add.group();

    // Create bullet group
    this.bullets = this.physics.add.group();

    // Setup controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Setup UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      color: '#ffffff'
    });

    this.levelText = this.add.text(16, 56, 'Level: 1', {
      fontSize: '32px',
      color: '#ffffff'
    });

    // Create dialogue box
    this.dialogueBox = new DialogueBox(this, width/2, height - 100);
    this.dialogueBox.showDialogue({
      text: 'Use arrow keys to move and SPACE to shoot!',
      duration: 3000
    });

    // Setup collisions
    this.physics.add.collider(this.bullets, this.enemies, this.hitEnemy, undefined, this);
    this.physics.add.collider(this.player, this.enemies, this.gameOver, undefined, this);

    // Start spawning enemies
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  update(time: number) {
    if (!this.player) return;

    // Player movement
    const speed = 300 * this.gameState.ship.speed;
    if (this.cursors.left.isDown) {
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocityX(speed);
    } else {
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    }

    // Shooting
    if (this.cursors.space.isDown) {
      const fireRate = 200 / this.gameState.ship.fireRate;
      if (time > this.lastFired) {
        const bullet = this.bullets.create(this.player.x, this.player.y - 20, undefined) as Phaser.GameObjects.Arc;
        if (bullet) {
          bullet.setCircle(4);
          (bullet.body as Phaser.Physics.Arcade.Body).setVelocityY(-600);
          this.lastFired = time + fireRate;
        }
      }
    }

    // Clean up off-screen objects
    this.bullets.children.each((bullet: Phaser.GameObjects.Arc) => {
      if (bullet.y < -10) {
        bullet.destroy();
      }
    });

    this.enemies.children.each((enemy: Phaser.GameObjects.Triangle) => {
      if (enemy.y > this.scale.height + 10) {
        enemy.destroy();
      }
    });
  }

  private spawnEnemy() {
    const x = Phaser.Math.Between(20, this.scale.width - 20);
    const enemy = this.add.triangle(x, -20, 0, 20, 20, -20, -20, -20, 0xff0000);
    this.enemies.add(enemy);
    (enemy.body as Phaser.Physics.Arcade.Body).setVelocityY(100 + (this.gameState.level * 10));
  }

  private hitEnemy(bullet: Phaser.GameObjects.Arc, enemy: Phaser.GameObjects.Triangle) {
    bullet.destroy();
    enemy.destroy();
    
    this.gameState.score += 10;
    this.scoreText.setText(`Score: ${this.gameState.score}`);

    if (this.gameState.score > 0 && this.gameState.score % 100 === 0) {
      this.gameState.level++;
      this.levelText.setText(`Level: ${this.gameState.level}`);
      this.dialogueBox.showDialogue({
        text: `Level Up! Level ${this.gameState.level}`,
        duration: 2000
      });
    }
  }

  private gameOver() {
    this.dialogueBox.showDialogue({
      text: 'Game Over! Click to restart',
      duration: 0
    });
    
    this.physics.pause();
    this.input.on('pointerdown', () => {
      this.scene.start('ShipSelectScene');
    });
  }
}
