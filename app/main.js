var game = new Phaser.Game(320, 480, Phaser.AUTO, 'game');
// var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game');

game.score = require("./score");

game.pacing = {
  baseSpeedMultiplier: 1,
  level: 0,
  levelSpeedIncrease: 0.75,
  roundSpeedIncrease: 0.95,
  wordScore: 100,
  starBreakPoints: [0.2, 0.5, 0.8]
};

game.COLORS = {
  'white': 0xFFFFFF,
  'red': 0xCC0000,
  'orange': 0xFF9900,
  'green': 0x33FF00,
  'blue': 0x3333FF,
  'purple': 0x9900CC,
  'brown': 0x7A5229,
  'pink': 0xFF5CAD,
  'yellow': 0xFFFF00
};

Level = require('./states/level');
Intro = require('./states/intro');
LevelEnd = require('./states/level-end');
game.state.add('intro', Intro, true);
game.state.add('level', Level);
game.state.add('levelEnd', LevelEnd);

window.game = game;
