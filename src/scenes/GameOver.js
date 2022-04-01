export default class GameOverScene extends Phaser.Scene {

    constructor() {
        super('GameOver');
    }

    preload() {
        this.load.image('button', 'images/buttonLong_brown.png');
    }

    create() {
        // Add background image
        let screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        let screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        let background = this.add.image(screenCenterX, screenCenterY, 'background');
        background.setScale(this.game.config.scale);
        
        let line1 = this.add.text(screenCenterX - 200, screenCenterY - 200, "GAME OVER", {font: "65px Arial Black", fill: "#fff", align: "center"});
        line1.stroke = "#292829";
        line1.strokeThickness = 16;
        line1.setShadow(2, 2, "#333333", 2, true, false);
    
        let resultText = "You caught " + this.registry.get('totalCaught') + " cuccos, and managed to finish " + this.registry.get('shipCompleted') + " shipment" + (this.registry.get('shipCompleted') != 1 ? "s" : "");
        let line2 = this.add.text(
            screenCenterX - 250,
            screenCenterY - 100,
            resultText,
            { font: "36px Arial Black", fill: "#fff", align: "center", wordWrap: true, wordWrap: { width: 600 } }
        );
        line2.setShadow(2, 2, "#333333", 2);
    
        let button = this.add.sprite(screenCenterX, screenCenterY + 100, "button");
        button.setInteractive();
        button.on('pointerdown', function(el) {
            this.scene.start("Game");
        }, this);
        
        this.add.text(
                button.x - button.width / 2,
                button.y - button.height / 2,
                "PLAY AGAIN",
                {font: "24px Arial", fill: "#fff", align: "center" , width: button.width}
            ).setPadding(button.width / 7, 10);
    }
}
