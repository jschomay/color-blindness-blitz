var game = new Phaser.Game(320, 480, Phaser.AUTO, 'game');
// var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game');
GameState = require('./states/play');
game.state.add('game', GameState, true);

window.game = game;
