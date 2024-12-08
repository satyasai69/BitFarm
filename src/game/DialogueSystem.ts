import Phaser from 'phaser';

export interface DialogueConfig {
  text: string;
  duration?: number;
}

export class DialogueBox extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Create background
    this.background = scene.add.rectangle(0, 0, 600, 100, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff);
    
    // Add text
    this.text = scene.add.text(0, 0, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    this.add([this.background, this.text]);
    scene.add.existing(this);
    this.setVisible(false);
  }

  showDialogue(config: DialogueConfig) {
    this.setVisible(true);
    this.text.setText(config.text);
    
    // Hide after duration
    if (config.duration) {
      this.scene.time.delayedCall(config.duration, () => {
        this.setVisible(false);
      });
    }
  }
}
