import ChickenFactory from "../gameobjects/ChickenFactory";

export default class GameScene extends Phaser.Scene {

    constructor() {

        super("Game");

        this.RUNAWAY_RADIUS = 300;

        this.options = {
            playMusic: true,
            difficulty: 0
        };
        // GUI Layer group
        this.gui;
        // GUI texts
        this.scoreText;
        this.timeText;
        this.shipmentsText;
        // In-game notifications
        this.notificationsQueue = [];
        // Time limit for the game
        this.timeLimit;
        // Entities Layer group
        this.entities;
        // Array containing cuccos
        this.chickens;
        // Current amount of cuccos displayed
        this.amount;
        this.maxAmount = 16;
        // Amount per shipment
        this.shipmentReq = [10, 50, 100, 200, 500, 1000, 5000];
        
        // Audio
        this.bgm = null;
        this.dieSound;

        this.caught = 0;

        this.timer;

        this.chickenFactory = new ChickenFactory();
    }

    preload() {
        this.load.image("background","images/background.png");
        this.load.image('tileGround','images/grassy_ground.png');
        this.load.image("clock", "images/gui.png");
        this.load.spritesheet("cucco", "images/bird.png", { frameWidth: 48, frameHeight: 63 });
        this.load.spritesheet("goldencucco", "images/goldenBird.png", { frameWidth: 48, frameHeight: 63 });
        this.load.spritesheet("cuccodie", "images/birdDeath.png", { frameWidth: 48, frameHeight: 63 });
        this.load.audio("bgm", ["audio/tlozmc_minigame.mp3"]);
        this.load.audio("cuccodiesound", ["audio/OOT_Cucco2.wav"]);
    }

    create() {
        // Reset game variables
        this.caught = 0;
        this.registry.set('totalCaught', 0);
        this.registry.set('shipCompleted', 0);

        this.registry.set('minSpeed', 50);
        this.registry.set('maxSpeed', 200);
        
        this.chickens = [];
        this.amount = 1;
        this.timeLimit = 60;
        
    
        // Add background image
        let screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        let screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.add.tileSprite(0, 0, this.sys.game.canvas.width * 2, this.sys.game.canvas.height * 2, 'tileGround');
        //let background = this.add.image(screenCenterX, screenCenterY, 'background');
        //background.setScale(this.game.config.scale);
        
        // Start playing background music
        try {
            if (this.options.playMusic) {
                if (this.bgm == undefined) {
                    this.bgm = this.sound.add("bgm");
                } else {
                    this.bgm.stop();
                }
                this.bgm.play('', { volume: 0.1, loop: true });
            }    
        } catch (e) {
            console.error(e);
        }
        
    
        // Set the die sound for future uses
        this.dieSound = this.sound.add("cuccodiesound");

        // Create animations
        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNumbers('cucco', { frames: [ 0, 1, 2, 3 ] }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'goldenmove',
            frames: this.anims.generateFrameNumbers('goldencucco', { frames: [ 0, 1, 2, 3 ] }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'die',
            frames: this.anims.generateFrameNumbers('cuccodie', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ] }),
            frameRate: 8,
            hideOnComplete: true
        });
    
        // Initialize texts
        this.gui = this.add.group();
        this.gui.create(150, 45, "clock");
        this.scoreText = this.add.text(110, 17, this.caught + "/" + this.shipmentReq[this.registry.get('shipCompleted')], {font: "18px Arial", fill: "#fff"});
        this.shipmentsText = this.add.text(290, 17, this.registry.get('shipCompleted'), {font: "18px Arial", fill: "#fff"});
        this.timeText = this.add.text(120, 50, this.timeLimit, {font: "18px Arial", fill: "#fff"});
        this.gui.add(this.scoreText);
        this.gui.add(this.shipmentsText);
        this.gui.add(this.timeText);

        // Setup event emitter for chickens
        this.input.on('gameobjectup', function (pointer, gameObject)
        {
            gameObject.emit('clicked', gameObject);
        }, this);

        // Add birds to the screen
        this.entities = this.add.group();
        this.addBirds();
        
        // Register mouse click for AI behavior
        this.input.on('pointerdown', this.runaway, this);

        // Start the game timer
        this.timer = this.time.addEvent({ delay: 9999000, callback: null, callbackScope: this });
    }

    update(time, delta) {
        // Get remaining time, limit it in 0
        let remainingTime = Math.floor(this.timeLimit - this.timer.getElapsedSeconds());
        remainingTime = remainingTime < 0 ? 0 : remainingTime;
    
        this.timeText.setText(remainingTime);

        // If the time is over, end the game
        if (remainingTime == 0) {
            this.gameOver();
        }
    }

    addBirds() {
        for (let i = 0; i < this.amount; i++) {
    
            if (this.chickens[i] == undefined || this.chickens[i].alive == false) {
                // If the sprite exists but is dead, try to destroy it
                try {
                    this.chickens[i].destroy();    
                } catch (e) {};
                
                // Initial position of the bird
                let randX = Math.floor(Math.random() * this.cameras.main.width);
                let randY = Math.floor(Math.random() * this.cameras.main.height);

                this.chickens[i] = this.chickenFactory.create(randX, randY, this.entities, this.physics, this.onBirdClick, this);
            }
        }
    }

    runaway() {
        let minSpeed = this.registry.get('minSpeed');
        let maxSpeed = this.registry.get('maxSpeed');

        for (let chicken of this.chickens) {
            if (!chicken.alive) { continue; }
    
            let distance = Math.sqrt(Math.pow(this.input.activePointer.worldX - chicken.x, 2) + Math.pow(this.input.activePointer.worldY - chicken.y, 2));
            
            if (distance <= this.RUNAWAY_RADIUS) {
                // Speed in pixels/second relative to the distance from the click point.
                // The nearer it is, the fastest it runs
                let relSpeed = (this.RUNAWAY_RADIUS / (this.RUNAWAY_RADIUS * distance)) * maxSpeed;
                if (relSpeed > maxSpeed) {
                    relSpeed = maxSpeed;
                } else if (relSpeed < minSpeed) {
                    relSpeed = minSpeed;
                }

                let dirX = chicken.x - this.input.activePointer.worldX;
                let dirY = chicken.y - this.input.activePointer.worldY;
    
                let velX = dirX + (relSpeed * (dirX < 0 ? -1 : 1));
                let velY = dirY + (relSpeed * (dirX < 0 ? -1 : 1));

                chicken.body.setVelocity(velX, velY);
            } else {
                // Increase speed of alive cuccos
                let velX = chicken.body.velocity.x * (1 + Math.random());
                let velY = chicken.body.velocity.y * (1 + Math.random());
    
                velX = Math.abs(velX) > maxSpeed ? maxSpeed * (velX / Math.abs(velX)) : velX;
                velY = Math.abs(velY) > maxSpeed ? maxSpeed * (velY / Math.abs(velY)) : velY;
    
                chicken.body.setVelocity(velX, velY);
            }
        }
    }

    onBirdClick(bird) {
        // If the bird is golden, add 10 seconds
        if (bird.name == "goldencucco") {
            this.timeLimit += 10;
            this.popupText("+10 secs!");
        }
    
        // Catch the bird pos to display the animation
        let x = bird.x;
        let y = bird.y;
        
        // Stop the bird and kill it
        bird.body.setVelocity(0, 0);
        bird.destroy();
        bird.alive = false;
    
        // Replace with death animation in the same spot
        let deadBird = this.entities.create(x, y, "cuccodie");
        deadBird.anims.play("die");
        deadBird.on('animationcomplete', function (animation, frame) {
            deadBird.destroy();
        }, this);

        
        // Play sound
        this.dieSound.play();
        
        // Update score
        this.caught++;
        this.registry.inc('totalCaught', 1);
    
        if (this.caught >= this.shipmentReq[this.registry.get('shipCompleted')]) {
            this.caught -= this.shipmentReq[this.registry.get('shipCompleted')];
            this.registry.inc('shipCompleted', 1);
            this.shipmentsText.setText(this.registry.get('shipCompleted'));
    
            if (this.registry.get('shipCompleted') == this.shipmentReq.length) {
                this.gameOver();
            }
    
            this.popupText("Shipment completed!");
        }
        
        this.scoreText.setText(this.caught + "/" + this.shipmentReq[this.registry.get('shipCompleted')]);
    
        // Increase the number of chickens
        this.amount = (this.amount >= this.maxAmount ? this.maxAmount : this.amount *= 2);
        
        // Increase minimum speed for chickens
        let minSpeed = this.registry.get('minSpeed');
        let maxSpeed = this.registry.get('maxSpeed');
        minSpeed *= (1 + Math.random());

        if (minSpeed > maxSpeed)
            minSpeed = maxSpeed;

        this.registry.set('minSpeed', minSpeed);
    
    
        this.runaway();
    
        this.addBirds();
    }

    popupText(msg) {
    
        if (this.notificationsQueue.length > 0) {
            this.notificationsQueue.forEach((notif) => {
                this.tweens.add({
                    targets: notif,
                    y: notif.y - 30,
                    ease: 'Linear',
                    duration: 100
                });
            });
        }
    
        let popupText = this.add.text(this.cameras.main.width - 20, this.cameras.main.height - 50, msg, {font: "24px Arial Black", fill: "#fff"}).setOrigin(1, 0);
        
        let timedCallback = function () {
            this.tweens.add({
                targets: popupText,
                y: popupText.y - 50,
                ease: 'Linear',
                alpha: 0,
                duration: 1000
            });
            this.notificationsQueue.pop();
        };
        this.time.addEvent({ delay: 2000, callback: timedCallback, callbackScope: this });
    
        this.notificationsQueue.push(popupText);
    }

    gameOver() {
        this.scene.start("GameOver");
    }
};
