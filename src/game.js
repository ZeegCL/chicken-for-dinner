import Phaser from 'phaser';
import MainMenuScene from './scenes/MainMenu.js';
import GameScene from './scenes/Game.js';
import GameOverScene from './scenes/GameOver.js';

let game;

// Dimensiones del canvas
let _width = 0;
let _height = 0;
let MAXWIDTH = 768;
let MAXHEIGHT = 672;



window.onload = function () {
    let container = document.getElementById('game-container');
    _width = (container.offsetWidth > MAXWIDTH ? MAXWIDTH : container.offsetWidth);
    _height = parseInt((_width / MAXWIDTH) * MAXHEIGHT);

    const config = {
        type: Phaser.AUTO,
        width: _width,
        height: _height,
        backgroundColor: '#182d3b',
        parent: 'game-container',
        physics: {
            default: 'arcade'
        },
        scene: [MainMenuScene, GameScene, GameOverScene],
    };
   
    game = new Phaser.Game(config);
    game.config.scale = _width / MAXWIDTH;
}