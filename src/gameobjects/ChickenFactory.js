export default class ChickenFactory 
{
    constructor() {
        
    }

    create(posX, posY, groupHandler, physicsHandler, callback, callbackContext) {
        let minSpeed = callbackContext.registry.get('minSpeed');
        let maxSpeed = callbackContext.registry.get('maxSpeed');

        let velX = Math.floor(minSpeed + (Math.random() * maxSpeed));
        let velY = Math.floor(minSpeed + (Math.random() * maxSpeed));
        velX = velX > maxSpeed ? maxSpeed : velX;
        velY = velY > maxSpeed ? maxSpeed : velY;
        // 5% chance to spawn a golden cucco
        let isGolden = (Math.random() * 100) <= 5;
        let birdType = isGolden ? "goldencucco" : "cucco";

        let chicken = groupHandler.create(posX, posY, birdType);
        chicken.name = birdType;
        chicken.alive = true;
        chicken.anims.play(isGolden ? "goldenmove" : "move");
        
        
        // Set physics
        physicsHandler.add.existing(chicken);
        chicken.body.setBounce(1, 1);
        chicken.body.setCollideWorldBounds(true);
        chicken.body.setVelocity(velX, velY);

        // Set interaction
        chicken.setInteractive();
        chicken.on('clicked', callback, callbackContext);

        return chicken;
    }
}