var game = new Phaser.Game(320, 480, Phaser.AUTO, 'game');
// var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game');
GameState = require('./states/play');
Intro = require('./states/intro');
game.state.add('intro', Intro, true);
game.state.add('play', GameState);

window.game = game;
