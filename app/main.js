// keep a 2 x 3 demention for the game
gameDimentions = {
  x: window.innerHeight * 2 / 3,
  y: window.innerHeight
};
var game = new Phaser.Game(gameDimentions.x, gameDimentions.y, Phaser.AUTO, 'game');

// load modules
game.score = require("./score");
game.levelManager = require("./levelManager")(game);
game.progress = require("./progress");
game.currentLevel = null;
game.drawStars = require("./lib/draw-stars")(game);
game.levelManager.setLevel(1, 1);

// constants
game.COLORS = {
  'white': 0xFFFFFF,
  'red': 0xCC0000,
  'orange': 0xFF9900,
  'green': 0x33FF00,
  'blue': 0x3333FF,
  'purple': 0x9900CC,
  'pink': 0xFF5CAD,
  'yellow': 0xFFFF00
};

// load states and start game
Level = require('./states/level');
Intro = require('./states/intro');
LevelSelect = require('./states/level-select');
LevelStart = require('./states/level-start');
LevelEnd = require('./states/level-end');

game.state.add('intro', Intro, true);
game.state.add('levelStart', LevelStart);
game.state.add('levelSelect', LevelSelect);
game.state.add('level', Level);
game.state.add('levelEnd', LevelEnd);
