export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('Title');

        this.WebFontConfig = {
            active: function() { this.time.events.add(Phaser.Timer.SECOND, create, this); },
            google: {
                families: ['Caveat Brush']
            }
        };
    }

    scale(number) {
        return number * this.game.config.scale;
    }

    preload() {
        this.load.image('background','images/background.png');
        this.load.image('button', 'images/buttonLong_brown.png');
        this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    }

    create() {

        // Add background image
        let screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        let screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        let background = this.add.image(screenCenterX, screenCenterY, 'background');
        background.setScale(this.game.config.scale);
        
        this.add.text(screenCenterX - 250, screenCenterY - 200, "Chickens", {font: "10rem Caveat Brush", fill: "#fff", align: "center"});
        
        this.add.text(screenCenterX - 170, screenCenterY - 50, "For Dinner", {font: "5rem Caveat Brush", fill: "#fff", align: "center"});
    
        let button = this.add.sprite(screenCenterX, screenCenterY + 100, "button");
        button.setInteractive();
        button.on('pointerdown', function(el) {
            this.scene.start("Game");
        }, this);
        
        this.add.text(
                button.x - button.width / 7,
                button.y - button.height / 4,
                "PLAY",
                {font: "24px Arial", fill: "#fff", align: "center"}
            );
    }
};
