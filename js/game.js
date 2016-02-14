(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var _cmp = 'components/';
  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf(_cmp) === 0) {
        start = _cmp.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return _cmp + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
require.register("entities/word", function(exports, require, module) {
module.exports = Word = function(game, level, x, y) {
    this.level = level;

    // call super
    Phaser.Sprite.call(this, game, x, y);

    this.kill();
    this.inputEnabled = true;
    this.events.onInputDown.add(this.tapWord, this);
};
Word.prototype = Object.create(Phaser.Sprite.prototype);
Word.prototype.constructor = Word;

// set up instance props upon revive
Word.prototype.init = function() {
    this.bitmapText = this.game.add.bitmapText(this.x, this.y, 'cbbfont', 'N', this.game.currentLevel.fontSize);

    if(this.game.levelManager.currentLevel >= 2) {
      // level 2+ challenge - mix up the sizes
      var randomFontAdjustment = this.game.rnd.integerInRange(-10, 10);
      this.bitmapText.fontSize = (parseInt(this.bitmapText.fontSize) + randomFontAdjustment) + 'px';
    }

    this.textSpacing = this.bitmapText.textWidth;
    this.text = this.level.assignRandomColor();
    this.bitmapText.setText(this.text.toUpperCase());
    this.bitmapText.updateText();
    this.addChild(this.bitmapText);
    this.bitmapText.tint = 0x444444;
    this.resizeToText();


    if(this.game.levelManager.currentLevel >= 3) {
      // level challenge 3+ - shuffled color names
      var shuffledColor = this.text[0] + Phaser.Utils.shuffle(this.text.slice(1,-1).split('')).join('') + this.text[this.text.length-1];
      this.bitmapText.setText(shuffledColor.toUpperCase());
    }
};

// nice animation on start up
Word.prototype.flashWord = function(cb) {
  this.alpha = 0;
  var flash = {progress: 0.3};
  var finalBrightness = 0.9;
  var speed = 300;
  // "stagger" the animation (this.z is the word's index in the group)
  var delay = 25 * this.z;
  var repeat = 1;
  var r = Phaser.Color.getRed(this.getHexColor());
  var g = Phaser.Color.getGreen(this.getHexColor());
  var b = Phaser.Color.getBlue(this.getHexColor());
  var t = this.game.add.tween(flash).to({progress: finalBrightness}, speed, Phaser.Easing.Quadratic.InOut, true, delay, repeat, true);
  t.onUpdateCallback(function(tween, p) {
    this.alpha = 1;
    this.bitmapText.tint = Phaser.Color.getColor(r * flash.progress,g * flash.progress,b * flash.progress);
  }, this);
  t.onComplete.add(function(){
    this.resetWord();
    cb();
  }, this);
};

Word.prototype.setFontContext = function() {
    this.bitmap.context.font = "bold " + this.game.currentLevel.fontSize + "px  Arial Black, Arial";
    this.bitmap.context.textAlign = 'center';
    this.bitmap.context.textBaseline = 'middle';
};

Word.prototype.resizeToText = function() {
    this.crop({x: 0, y: 0, width: this.bitmapText.textWidth + this.textSpacing, height: this.bitmapText.textHeight});
};

Word.prototype.resetWord = function () {
  this.alpha = 1;
  this.bitmapText.tint = 0x444444;
};

Word.prototype.outOfPlay = function () {
  this.alive = false;
  this.level.removeFromRemainingColors(this);
};


Word.prototype.feedbackWrong = function(cb) {
  this.bitmapText.tint = this.level.targetColorHex;
  var duration = 1000;
  var ease = Phaser.Easing.Cubic.Out;
  var delay = 230;
  var t = this.game.add.tween(this).to({alpha: 0, angle: 360 * 2, x: this.x + 90, y: this.y + 20}, duration, ease, true, delay);
  this.game.add.tween(this.scale).to({x: 0, y: 0}, duration, ease, true, delay);
  t.onComplete.add(cb, this);
};

Word.prototype.feedbackCorrect = function(cb) {
  // grow and fade
  this.bitmapText.tint = this.level.targetColorHex;
  var duration = 800;
  var ease = Phaser.Easing.Cubic.Out;
  var offset =  {};
  offset.x = this.x - this.width / 1;
  offset.y = this.y - this.height;
  var t = this.game.add.tween(this).to({alpha: 0, x: offset.x, y: offset.y}, duration, ease, true);
  this.game.add.tween(this.scale).to({x: 4, y: 4}, duration, ease, true);
  t.onComplete.add(cb, this);
};

Word.prototype.tapWord = function(){
  if (this.level.roundIsOver || !this.alive) {
    return;
  }
  if(this.game.levelManager.currentLevel >= 4 && this.bitmapText.angle === 0 && this.level.playIsCorrect(this)) {
    // level challenge 4+ - first tap turns words upside down
    this.level.endRound(this, true);
  } else {
    this.outOfPlay();
    this.level.endRound(this);
  }
};

// highlights the word
Word.prototype.highlight = function(color) {
  this.bitmapText.tint = color;
  this.alpha = 1;
};

Word.prototype.doMissed = function () {
  // player was too slow
  this.outOfPlay();
  this.visible = false; // don't want to see the feedbackWrong
};

Word.prototype.update = function() {
};

Word.prototype.getHexColor = function() {
  return this.game.COLORS[this.text];
};


});

require.register("levelManager", function(exports, require, module) {
module.exports = function (game) {
  var levels = require("./levels");
  return {
    currentLevel: 1,
    currentSubLevel: 1,
    numLevels: levels.length,
    isNextLevel: function(levelNum){
      levelNum = levelNum || this.currentLevel;
      return levelNum + 1 <= this.numLevels;
    },
    isPreviousLevel: function(levelNum){
      levelNum = levelNum || this.currentLevel;
      return levelNum > 1;
    },
    getLevel: function(level) {
      return levels[level - 1];
    },
    setLevel: function(level, subLevel) {
      this.currentLevel = level;
      this.currentSubLevel = subLevel;
      game.currentLevel = levels[this.currentLevel - 1][this.currentSubLevel - 1];
    },
    nextLevel: function() {
      if (levels[this.currentLevel - 1][this.currentSubLevel]) {
        this.setLevel(this.currentLevel, this.currentSubLevel + 1);
      } else {
        this.setLevel(this.currentLevel + 1, 1);
      }
    }
  };
};

});

require.register("levels", function(exports, require, module) {
module.exports = [
  [
    {
      "level": 1,
      "subLevel": 1,
      "levelColor": "red",
      "levelName": "Color palettes",
      "roundDuration": 5000,
      "activeColors": ['red','blue', 'yellow'],
      "fontSize" : 70,
      "wordScore": 100,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 1,
      "subLevel": 2,
      "levelColor": "red",
      "levelName": "Color palettes",
      "roundDuration": 4000,
      "activeColors": ['orange','green','purple'],
      "fontSize" : 70,
      "wordScore": 100,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 1,
      "subLevel": 3,
      "levelColor": "red",
      "levelName": "Color palettes",
      "roundDuration": 3000,
      "activeColors": ['yellow','blue','purple', 'orange'],
      "fontSize" : 50,
      "wordScore": 120,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 1,
      "subLevel": 4,
      "levelColor": "red",
      "levelName": "Color palettes",
      "roundDuration": 3000,
      "activeColors": ['red','orange','pink', 'yellow'],
      "fontSize" : 45,
      "wordScore": 130,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 1,
      "subLevel": 5,
      "levelColor": "red",
      "levelName": "Color palettes",
      "roundDuration": 2000,
      "activeColors": ['green','blue','purple', 'pink'],
      "fontSize" : 40,
      "wordScore": 150,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 1,
      "subLevel": 6,
      "levelColor": "red",
      "levelName": "Color palettes",
      "roundDuration": 1700,
      "activeColors": ['red','orange','green','blue','purple', 'pink', 'yellow'],
      "fontSize" : 35,
      "wordScore": 100,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    }
  ],
  [
    {
      "level": 2,
      "subLevel": 1,
      "levelColor": "orange",
      "levelName": "Big and small",
      "roundDuration": 5000,
      "activeColors": ['red','blue', 'yellow'],
      "fontSize" : 70,
      "wordScore": 100,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 2,
      "subLevel": 2,
      "levelColor": "orange",
      "levelName": "Big and small",
      "roundDuration": 4000,
      "activeColors": ['orange','green','purple'],
      "fontSize" : 70,
      "wordScore": 100,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 2,
      "subLevel": 3,
      "levelColor": "orange",
      "levelName": "Big and small",
      "roundDuration": 3000,
      "activeColors": ['yellow','blue','purple', 'orange'],
      "fontSize" : 50,
      "wordScore": 120,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 2,
      "subLevel": 4,
      "levelColor": "orange",
      "levelName": "Big and small",
      "roundDuration": 3000,
      "activeColors": ['red','orange','pink', 'yellow'],
      "fontSize" : 45,
      "wordScore": 130,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 2,
      "subLevel": 5,
      "levelColor": "orange",
      "levelName": "Big and small",
      "roundDuration": 2000,
      "activeColors": ['green','blue','purple', 'pink'],
      "fontSize" : 40,
      "wordScore": 150,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 2,
      "subLevel": 6,
      "levelColor": "orange",
      "levelName": "Big and small",
      "roundDuration": 1700,
      "activeColors": ['red','orange','green','blue','purple', 'pink', 'yellow'],
      "fontSize" : 35,
      "wordScore": 100,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    }
  ],
  [
    {
      "level": 3,
      "subLevel": 1,
      "levelColor": "green",
      "levelName": "Jumble",
      "roundDuration": 5000,
      "activeColors": ['red','blue', 'yellow'],
      "fontSize" : 70,
      "wordScore": 100,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 3,
      "subLevel": 2,
      "levelColor": "green",
      "levelName": "Jumble",
      "roundDuration": 4000,
      "activeColors": ['orange','green','purple'],
      "fontSize" : 70,
      "wordScore": 100,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 3,
      "subLevel": 3,
      "levelColor": "green",
      "levelName": "Jumble",
      "roundDuration": 3000,
      "activeColors": ['yellow','blue','purple', 'orange'],
      "fontSize" : 50,
      "wordScore": 120,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 3,
      "subLevel": 4,
      "levelColor": "green",
      "levelName": "Jumble",
      "roundDuration": 3000,
      "activeColors": ['red','orange','pink', 'yellow'],
      "fontSize" : 45,
      "wordScore": 130,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 3,
      "subLevel": 5,
      "levelColor": "green",
      "levelName": "Jumble",
      "roundDuration": 2000,
      "activeColors": ['green','blue','purple', 'pink'],
      "fontSize" : 40,
      "wordScore": 150,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 3,
      "subLevel": 6,
      "levelColor": "green",
      "levelName": "Jumble",
      "roundDuration": 1700,
      "activeColors": ['red','orange','green','blue','purple', 'pink', 'yellow'],
      "fontSize" : 35,
      "wordScore": 100,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
  ],
  [
    {
      "level": 4,
      "subLevel": 1,
      "levelColor": "blue",
      "levelName": "Topsy Turvy",
      "roundDuration": 5000,
      "activeColors": ['red','blue', 'yellow'],
      "fontSize" : 70,
      "wordScore": 100,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 4,
      "subLevel": 2,
      "levelColor": "blue",
      "levelName": "Topsy Turvy",
      "roundDuration": 4000,
      "activeColors": ['orange','green','purple'],
      "fontSize" : 70,
      "wordScore": 100,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 4,
      "subLevel": 3,
      "levelColor": "blue",
      "levelName": "Topsy Turvy",
      "roundDuration": 3000,
      "activeColors": ['yellow','blue','purple', 'orange'],
      "fontSize" : 50,
      "wordScore": 120,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 4,
      "subLevel": 4,
      "levelColor": "blue",
      "levelName": "Topsy Turvy",
      "roundDuration": 3000,
      "activeColors": ['red','orange','pink', 'yellow'],
      "fontSize" : 45,
      "wordScore": 130,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 4,
      "subLevel": 5,
      "levelColor": "blue",
      "levelName": "Topsy Turvy",
      "roundDuration": 2000,
      "activeColors": ['green','blue','purple', 'pink'],
      "fontSize" : 40,
      "wordScore": 150,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
    {
      "level": 4,
      "subLevel": 6,
      "levelColor": "blue",
      "levelName": "Topsy Turvy",
      "roundDuration": 1700,
      "activeColors": ['red','orange','green','blue','purple', 'pink', 'yellow'],
      "fontSize" : 35,
      "wordScore": 100,
      "starBreakPoints": [
        0.2,
        0.5,
        0.8
      ]
    },
  ],
];

});

require.register("lib/draw-stars", function(exports, require, module) {
module.exports = function(game) {
  function fillStars(width, num, graphics){
    if (typeof graphics === "undefined") {
      var graphics = game.add.graphics(0,0);
    }
    return _drawStars(graphics, width, num);
  }

  function drawEmptyStars(width, graphics){
    if (typeof graphics === "undefined") {
      var graphics = game.add.graphics(0,0);
    }
    return _drawStars(graphics, width, 3, true);
  }

  function drawStars(width, num) {
    var graphics = game.add.graphics(0,0);
    drawEmptyStars(width, graphics);
    fillStars(width, num, graphics);
    return graphics;
  }

  function _drawStars(graphics, width, num, empty) {
    if (typeof num === "undefined") {
      num = 3;
    }
    var starColors = [
      "blue",
      "purple",
      "green",
    ];
    var alpha = empty ? 0.2 : 1;
    for (var i = 0; i < num; i++) {
      var position = {x: width * (i + 1) / 4, y: 0};
      var starWidth = width / 10;
      drawStar.call(this, graphics, position.x, position.y, starWidth, game.COLORS[starColors[i]], alpha);
    }
    return graphics;
  };

  // thanks to http://stackoverflow.com/questions/25837158/how-to-draw-a-star-by-using-canvas-html5
  function drawStar(graphics, cx,cy, width, color, alpha){
    var spikes = 5;
    var outerRadius = width;
    var innerRadius = outerRadius / 3;
    var rot=Math.PI/2*3;
    var x=cx;
    var y=cy;
    var step=Math.PI/spikes;

    graphics.beginFill(color, alpha);
    graphics.moveTo(cx,cy-outerRadius);
    for(i=0;i<spikes;i++){
      x=cx+Math.cos(rot)*outerRadius;
      y=cy+Math.sin(rot)*outerRadius;
      graphics.lineTo(x,y);
      rot+=step;

      x=cx+Math.cos(rot)*innerRadius;
      y=cy+Math.sin(rot)*innerRadius;
      graphics.lineTo(x,y);
      rot+=step;
    }
    graphics.lineTo(cx,cy-outerRadius);
  }
  return {
    drawEmptyStars: drawEmptyStars,
    fillStars: fillStars,
    drawStars: drawStars
  };
}



});

;require.register("main", function(exports, require, module) {
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
GameWin = require('./states/game-win');

game.state.add('intro', Intro, true);
game.state.add('levelStart', LevelStart);
game.state.add('levelSelect', LevelSelect);
game.state.add('level', Level);
game.state.add('levelEnd', LevelEnd);
game.state.add('gameWin', GameWin);

});

require.register("progress", function(exports, require, module) {
var progress = JSON.parse(localStorage.getItem('cbb_progress') || '[]');
module.exports = {
  saveLevelProgress: function(level, sublevel, data) {
    if(!progress[level - 1]) {
      progress[level - 1] = [];
    }
    // only save progress if it is better than a previous score
    if(this.getLevelProgress(level, sublevel).score < data.score) {
      progress[level - 1][sublevel - 1] = data;
    }
    localStorage.setItem('cbb_progress', JSON.stringify(progress));
  },
  getLevelProgress: function(level, sublevel) {
    if(!progress[level - 1]) {
      progress[level - 1] = [];
    }
    if(!progress[level - 1][sublevel - 1]) {
      progress[level - 1][sublevel - 1] = {score:0, stars:0};
    }
    return progress[level - 1][sublevel - 1];
  },
  // level status:
  // levels with 1+ stars are COMPLETE
  // levels with < 1 stars are READY
  // levels immediately after a completed level are READY
  // all others are LOCKED
  // execpt very fist level/sublevel starts out READY
  getLevelStatus: function(level, sublevel) {
    if (this.getLevelProgress(level, sublevel).score > 0) {
      // level has a score
      if(this.getLevelProgress(level, sublevel).stars >= 1) {
        return this.COMPLETE;
      } else {
        return this.READY;
      }
    } else if (level === 1 && sublevel === 1) {
      // very first level/sublevel
      return this.READY;   
    } else if (sublevel > 1) {
      // any sublevel higher than 1
     if (this.getLevelStatus(level, sublevel - 1) === this.COMPLETE) {
       return this.READY;
     } else {
       return this.LOCKED;
     }
    } else {
      // first stublevel of a level higher than 1
      var subLevelsPerLevel = 6;
     if (this.getLevelStatus(level - 1, subLevelsPerLevel) === this.COMPLETE) {
       return this.READY;
     } else {
       return this.LOCKED;
     }
    }
  },
  LOCKED: 0,
  READY: 1,
  COMPLETE: 2
};

});

require.register("score", function(exports, require, module) {
module.exports = {
  levelScore: 0,
  levelStars: 0,
  maxLevelScore: 0,
  currentStreak: 0,
  scoreMultiplier: 1,
  multiplierFrequency: 4,
  startLevel: function (game, wordsPool) {
    this.game = game;
    this.currentStreak = 0;
    this.scoreMultiplier = 1;
    this.levelScore = 0;
    this.levelStars = 0;
    this.maxLevelScore = this.calculateMaxLevelScore(wordsPool);
  },
  correct: function(wordScore, timeRemaining) {
    // dampen score value over time quadratically
    var points = wordScore * Phaser.Easing.Quadratic.Out(timeRemaining);

    // raise multiplier every Xth word (multiplierFrequency)
    this.currentStreak++;
    if (this.currentStreak % this.multiplierFrequency === 0) {
      this.scoreMultiplier++;
    }

    // round up to nearest 10 (and apply multiplier)
    points = this.scoreMultiplier * Math.ceil(points/10)*10;
    this.levelScore += points;

    return points;
  },
  wrong: function() {
    console.log("No points!  Streak ended!");
    this.scoreMultiplier = 1;
    this.currentStreak = 0;
  },
  calculateMaxLevelScore: function(wordsPool) {
    var maxLevelScore = 0;
    for (var i = 1; i <= wordsPool.length; i++) {
      maxLevelScore += 100 * (Math.floor(i / this.multiplierFrequency) + 1);
    }
    return maxLevelScore;
  },
  getStarsFromScore: function(score, maxScore){
    score = score || this.levelScore;
    maxScore = maxScore || this.maxLevelScore;
    var stars = 0;
    for (var i = 0; i < this.game.currentLevel.starBreakPoints.length; i++) {
      if (score / maxScore >= this.game.currentLevel.starBreakPoints[i]) {
        stars++;
      }
    }
    return stars;
  }
};

});

require.register("states/game-win", function(exports, require, module) {
  function GameWin() {}

  GameWin.prototype = {
    preload: function() {
    },
    create: function() {
      var style = { font: 'bold 55px Arial', fill: '#ffffff', align: 'center'};
      style.fill = Phaser.Color.RGBtoWebstring(this.game.COLORS.green);
      this.titleText = this.game.add.text(this.game.world.centerX, 190, 'You win!', style);
      this.titleText.anchor.setTo(0.5, 0.5);

      this.winNotes = this.game.add.text(this.game.world.centerX, this.game.height - 100, 'Thank you for playing!  That\'s it for now.  If you had a good time, share this game with your friends.', { font: '16px Arial', fill: '#ffffff', align: 'left', wordWrap: true, wordWrapWidth: this.game.width * 0.8});
      this.winNotes.anchor.setTo(0.5, 1);
    },
    update: function() {
      if(this.game.input.activePointer.justPressed()) {
        this.game.state.start('levelSelect');
      }
    }
  };

  module.exports = GameWin

});

;require.register("states/intro", function(exports, require, module) {
  function Intro() {}

  Intro.prototype = {
    preload: function() {
      // set scaling for game
      this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.game.scale.refresh();
    },
    create: function() {
      var style = { font: 'bold 55px Arial', fill: '#ffffff', align: 'center'};
      style.fill = Phaser.Color.RGBtoWebstring(this.game.COLORS.red);
      this.titleText1 = this.game.add.text(this.game.world.centerX, 80, 'Color', style);
      style.fill = Phaser.Color.RGBtoWebstring(this.game.COLORS.blue);
      this.titleText2 = this.game.add.text(this.game.world.centerX, 130, 'Blindness', style);
      style.fill = Phaser.Color.RGBtoWebstring(this.game.COLORS.green);
      this.titleText3 = this.game.add.text(this.game.world.centerX, 190, 'Blitz', style);
      this.titleText1.anchor.setTo(0.5, 0.5);
      this.titleText2.anchor.setTo(0.5, 0.5);
      this.titleText3.anchor.setTo(0.5, 0.5);

      this.instructionsText = this.game.add.text(this.game.world.centerX, this.game.height - 100, 'You must clear all the words from the screen.\n\nWhen a word lights up, tap a word matching the lit up word\'s color, not the color it spells.\n\nTap to begin...', { font: '16px Arial', fill: '#ffffff', align: 'left', wordWrap: true, wordWrapWidth: this.game.width * 0.8});
      this.instructionsText.anchor.setTo(0.5, 1);
    },
    update: function() {
      if(this.game.input.activePointer.justPressed()) {
        this.game.state.start('levelSelect');
      }
    }
  };

  module.exports = Intro

});

;require.register("states/level-end", function(exports, require, module) {
function LevelEnd() {}

LevelEnd.prototype = {
    preload: function() {

    },
    create: function() {
      this.previousScore = this.game.progress.getLevelProgress(this.game.currentLevel.level, this.game.currentLevel.subLevel);
      // save progress
      this.game.score.levelStars = this.game.score.getStarsFromScore();
      this.game.progress.saveLevelProgress(this.game.currentLevel.level, this.game.currentLevel.subLevel, {
        score: this.game.score.levelScore,
        stars: this.game.score.levelStars
      });

      // level #
      var style = { font: 'bold 40px Arial', fill: '#ffffff', align: 'center'};
      this.titleText = this.game.add.text(this.game.world.centerX, 80, 'Level '+this.game.currentLevel.level+'-'+this.game.currentLevel.subLevel+'\nFinished', style);
      this.titleText.anchor.setTo(0.5, 0.5);

      // draw star outlines
      var emptyStarsGraphic = this.game.drawStars.drawEmptyStars(this.game.width);
      emptyStarsGraphic.y = 180;

      // high score
      var style = { font: 'bold 16px arial', fill: '#ffffff', align: 'center'};
      var highScoreText;
      if(this.game.score.levelScore > this.previousScore.score) {
        highScoreText = "New high score!";
      } else {
        highScoreText = "Best score: " + this.previousScore.score;
      }
      this.highScoreTextSprite = this.game.add.text(this.game.world.centerX, 280, highScoreText, style);
      this.highScoreTextSprite.anchor.setTo(0.5, 0.5);

      // score
      this.scoreText = this.game.add.text(this.game.world.centerX, 250, 'Score: 0', { font: '38px Arial', fill: '#ffffff', align: 'left'});
      this.scoreText.anchor.setTo(0.5, 0.5);

      // try again
      this.tryAgain = this.game.add.text(this.game.width / 4, 380, 'TRY\nAGAIN', { font: '26px Arial', fill: '#ffffff', align: 'center'});
      this.tryAgain.anchor.setTo(0.5, 0.5);
      this.tryAgain.inputEnabled = true;
      this.tryAgain.events.onInputDown.add(function(){
        this.tryAgain.input.destroy();
        this.startLevel();
      }, this);

      // next level
      this.nextLevel = this.game.add.text(this.game.width * 3 / 4, 380, 'NEXT\nLEVEL', { font: '26px Arial', fill: '#ffffff', align: 'center'});
      this.nextLevel.anchor.setTo(0.5, 0.5);
      this.nextLevel.inputEnabled = true;
      this.nextLevel.alpha = 0.2;
      this.nextLevel.events.onInputDown.add(function(){
        if(this.game.score.levelStars >= 1) {
          if(!this.game.levelManager.isNextLevel()) {
            this.cleanUp();
            this.game.state.start('gameWin');
            return
          }
          this.nextLevel.input.destroy();
          this.game.levelManager.nextLevel();
          this.startLevel();
        }
      }, this);

      // progress bar
      this.drawProgressBar({x: this.game.width * 0.1, y: 310});
    }
  };

LevelEnd.prototype.cleanUp = function () {
  // clean things up
  this.progressTween.stop();
  this.highScoreTextSprite = null;
  this.progressTween = null;
  this.titleText = null;
  this.scoreText = null;
  this.tryAgain = null;
  this.nextLevel = null;
};

LevelEnd.prototype.startLevel = function () {
  this.cleanUp();
  // load next state
  this.game.state.start('levelStart');
};

LevelEnd.prototype.drawProgressBar = function(position){
  console.log("you scored", this.game.score.levelScore, 'out of', this.game.score.maxLevelScore);

  var percentage;
  if(this.game.score.levelScore > this.game.score.maxLevelScore) {
    // could happen with bonuses
    percentage = 1;
  } else {
    percentage = this.game.score.levelScore / this.game.score.maxLevelScore;
  }

  var color = 0xffd900;

  var bestScore = this.game.add.graphics(position.x, position.y);
  // set a fill and line style
  bestScore.beginFill();
  bestScore.lineStyle(20, color, 0.5);
  // draw best possible score
  bestScore.moveTo(0, 0);
  bestScore.lineTo(this.game.width * 0.8, 0);
  bestScore.endFill();

  var playerScore = this.game.add.graphics(position.x, position.y);
  // set a fill and line style
  playerScore.beginFill();
  playerScore.lineStyle(20, color, 1);
  // draw player's score
  playerScore.moveTo(0, 0);
  playerScore.lineTo(percentage * this.game.width * 0.8, 0);
  playerScore.endFill();


  playerScore.scale.x = 0;
  var score = 0;
  var stars = 0;
  var starsGraphic;
  this.progressTween = this.game.add.tween(playerScore.scale);
  this.progressTween.to({x: 1}, 3500, Phaser.Easing.Quadratic.Out, true);
  this.progressTween.onUpdateCallback(function(){
        score = Math.round(this.game.score.levelScore * playerScore.scale.x);
        this.scoreText.text =  'Score: ' + score;
        if (score / this.game.score.maxLevelScore >= this.game.currentLevel.starBreakPoints[stars]) {
          starsGraphic = null
          starsGraphic = this.game.drawStars.fillStars(this.game.width, ++stars);
          starsGraphic.y = 180;
          if (stars >= 1) {
            this.nextLevel.alpha = 1;
          }
        }
    }, this);
};

module.exports = LevelEnd;

});

require.register("states/level-select", function(exports, require, module) {
function LevelSelect() {}

LevelSelect.prototype = {
    preload: function() {

    },
    create: function() {
      // make levels
      this.levels = this.game.add.group();
      for (var l = 1; l <= this.game.levelManager.numLevels; l++) {
        levelData = this.game.levelManager.getLevel(l)[0];
        this.levels.addChild(this.makeLevel(l - 1, levelData));
      }
    }
};

LevelSelect.prototype.makeLevel = function (levelIndex, levelData) {
  var levelGroup = this.game.add.group();
  levelGroup.x = this.game.width * levelIndex;

  levelGroup.levelColor = levelData.levelColor;
  levelGroup.levelColorHex = this.game.COLORS[levelGroup.levelColor];
  levelGroup.level = levelData.level;
  levelGroup.levelName = levelData.levelName;

  // title
  var style = { font: 'bold 40px Arial', fill: Phaser.Color.RGBtoWebstring(0xFFFFFF), align: 'center'};
  var levelNumber = this.game.add.text(this.game.world.centerX, this.game.height / 10, 'Level '+levelGroup.level, style);
  levelNumber.anchor.setTo(0.5, 0.5);
  levelGroup.addChild(levelNumber)

  // sub heading
  style = { font: '24px Arial', fill: Phaser.Color.RGBtoWebstring(levelGroup.levelColorHex), align: 'center'};
  var status = this.game.progress.getLevelStatus(levelGroup.level, 1);
  var levelTitleText;
  if(status === this.game.progress.LOCKED) {
    levelTitleText = "????";
  } else {
    levelTitleText = '"'+levelGroup.levelName+'"';
  }
  var subHeading = this.game.add.text(this.game.world.centerX, this.game.height / 5, levelTitleText, style);
  subHeading.anchor.setTo(0.5, 0.5);
  levelGroup.addChild(subHeading);

  // choose a level
  style = { font: 'bold 20px Arial', fill: Phaser.Color.RGBtoWebstring(0xFFFFFF), align: 'center'};
  var chooseText = this.game.add.text(this.game.world.centerX, this.game.height / 2 - this.game.height / 30, "Choose a level:", style);
  chooseText.anchor.setTo(0.5, 0.5);
  levelGroup.addChild(chooseText);

  // arrows
  if (this.game.levelManager.isNextLevel(levelIndex + 1)) {
    var rightArrow = this.addArrow(levelGroup, "right");
    levelGroup.addChild(rightArrow);
  }
  if (this.game.levelManager.isPreviousLevel(levelIndex + 1)) {
    var leftArrow = this.addArrow(levelGroup, "left");
    levelGroup.addChild(leftArrow);
  }

  // subLevels
  var subLevels = this.game.add.group();
  levelGroup.addChild(subLevels);
  var subLevelNumber = 1;
  var margin = this.game.width * 0.05;
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 3; j++) {
      var x = margin * 1 + j * this.game.width / 3 - j * margin / 2;
      var y = this.game.height / 2 + margin / 2 + i * this.game.height / 4 - i * margin / 2;
      var width = this.game.width / 3 - margin;
      var height =this.game.height / 4 - margin;
      subLevels.add(this.makeSubLevel(levelGroup, x, y, width, height, subLevelNumber++));
    }
  }

  return levelGroup;
};


LevelSelect.prototype.makeSubLevel = function (level, x, y, width, height, subLevelNumber) {
  var subLevelBox = this.game.add.sprite(x,y);

  // border
  var graphics = this.game.add.graphics(0, 0);
  graphics.lineStyle(1, level.levelColorHex);
  graphics.drawRect(0, 0, width, height);
  subLevelBox.addChild(graphics);
  subLevelBox.crop({x: x, y: y, width: width, height: height});

  // title
  var style = { font: 'bold 20px Arial', fill: Phaser.Color.RGBtoWebstring(0xFFFFFF), align: 'center'};
  var title = this.game.add.text(width / 2, height / 20, level.level+'-'+subLevelNumber, style);
  title.anchor = {x: 0.5, y: 0};
  subLevelBox.addChild(title);

  // check progress
  var status = this.game.progress.getLevelStatus(level.level, subLevelNumber);
  var levelProgress = this.game.progress.getLevelProgress(level.level, subLevelNumber);
  if(status === this.game.progress.READY || status === this.game.progress.COMPLETE) {
    // stars
    var stars = this.game.drawStars.drawStars(subLevelBox.width, levelProgress.stars);
    stars.y = subLevelBox.height / 2;
    subLevelBox.addChild(stars);
    // play text
    var style = { font: '16px Arial', fill: Phaser.Color.RGBtoWebstring(this.game.COLORS['orange']), align: 'center'};
    var playText = this.game.add.text(width / 2, height * 3 / 4, "Play", style);
    playText.anchor = {x: 0.5, y: 0};
    subLevelBox.addChild(playText);
  } else {
    // locked
    var style = { font: '20px Arial', fill: Phaser.Color.RGBtoWebstring(0x444444), align: 'center'};
    var lockedText = this.game.add.text(width / 2, height / 2, "Locked", style);
    lockedText.anchor = {x: 0.5, y: 0};
    subLevelBox.addChild(lockedText);
  }

  // on select
  if(status !== this.game.progress.LOCKED) {
    subLevelBox.inputEnabled = true;
    subLevelBox.events.onInputDown.add(function(){
      subLevelBox.input.destroy();
      this.selectLevel(level.level, subLevelNumber);
    },this);
  }

  return subLevelBox;
};

LevelSelect.prototype.addArrow = function (level, direction) {
  var x = direction === "right" ? this.game.width - this.game.width / 10 : this.game.width / 20;
  var y = this.game.width / 2;
  var arrow = this.game.add.graphics(0, 0);
  arrow.beginFill(level.levelColorHex);
  arrow.moveTo(0,0);
  arrow.lineTo(this.game.width / 20, this.game.width / 20);
  arrow.lineTo(0, 2 * this.game.width / 20);
  arrow.lineTo(0, 0);
  if (direction !== "right") {
    arrow.scale.x *= -1;
    arrow.x = x;
  }
  var arrowSprite = this.game.add.sprite(x, y);
  arrowSprite.addChild(arrow);

  // handler
  if (direction !== "right") {
    arrowSprite.handler = this.previousLevel;
  } else {
    arrowSprite.handler = this.nextLevel;
  }

  // on select
  arrowSprite.inputEnabled = true;
  arrowSprite.events.onInputDown.add(arrowSprite.handler, this);

  return arrowSprite;
};

LevelSelect.prototype.nextLevel = function () {
  this.game.add.tween(this.levels).to({x: this.levels.x - this.game.width}, 300, Phaser.Easing.Quadratic.InOut, true);
};

LevelSelect.prototype.previousLevel = function () {
  this.game.add.tween(this.levels).to({x: this.levels.x + this.game.width}, 300, Phaser.Easing.Quadratic.InOut, true);
};

LevelSelect.prototype.selectLevel = function (level, subLevel) {
  // clean things up
  this.levels.destroy();

  // select level
  this.game.levelManager.setLevel(level, subLevel);

  // load next state
  this.game.state.start('levelStart');
};


module.exports = LevelSelect;

});

require.register("states/level-start", function(exports, require, module) {
function LevelStart() {}

LevelStart.prototype = {
    preload: function() {

    },
    create: function() {
      // level #
      var style = { font: 'bold 40px Arial', fill: '#ffffff', align: 'center'};
      this.levelNumber = this.game.add.text(this.game.world.centerX, 100, 'Level '+this.game.currentLevel.level+'-'+this.game.currentLevel.subLevel, style);
      this.levelNumber.anchor.setTo(0.5, 0.5);

      // play
      this.play = this.game.add.text(this.game.width / 2, 300, 'PLAY NOW', { font: 'bold 36px Arial', fill: Phaser.Color.RGBtoWebstring(this.game.COLORS.orange), align: 'center'});
      this.play.anchor.setTo(0.5, 0.5);
      this.play.inputEnabled = true;
      this.play.events.onInputDown.add(function(){
        this.play.input.destroy();
        this.changeState('level');
      },this);

      // back
      this.back = this.game.add.text(this.game.width / 2, 375, 'Change level', { font: 'bold 20px Arial', fill: Phaser.Color.RGBtoWebstring(this.game.COLORS.white), align: 'center'});
      this.back.anchor.setTo(0.5, 0.5);
      this.back.inputEnabled = true;
      this.back.events.onInputDown.add(function(){
        this.back.input.destroy();
        this.changeState('levelSelect');
      },this);
    }
  };

LevelStart.prototype.changeState = function (state) {
  // clean things up
  this.levelNumber = null;
  this.play = null;

  // load state
  this.game.state.start(state);
};


module.exports = LevelStart;

});

require.register("states/level", function(exports, require, module) {
module.exports = Level = function() {
};

// Load images and sounds
Level.prototype.preload = function() {
    this.load.bitmapFont('cbbfont', 'CBB/CBB.png', 'CBB/CBB.fnt');  
};

// Set up the game and kick it off
Level.prototype.create = function() {
    this.game.stage.backgroundColor = 0 * 0xFFFFFF;

    // game props
    this.roundNumber = 1;
    this.roundTimer = {timeRemaining: 1}; // as a percentage of round duration
    this.roundTimerTween = null;
    this.wordScore = this.game.currentLevel.wordScore;
    this.targetWord = undefined;
    this.targetColorHex = 0xFFFFFF;
    this.targetColorWord = "white";
    this.roundIsOver = true;
    this.wordsPool = this.game.add.group();
    this.missedWordsPool = this.game.add.group();
    this.pointsPool = this.game.add.group();
    // start points pool with 10 objects
    for(var i = 0; i < 10; i++) {
        this.addPointsToPool();
    }
    
    // Show FPS
    // this.game.time.advancedTiming = true;
    // this.fpsText = this.game.add.text(
    //     20, 20, '', { font: '16px Arial', fill: '#ffffff' }
    // );

    this.buildWordGrid();

    this.game.score.startLevel(this.game, this.wordsPool);

    // start the game!
    this.startLevel();
};

Level.prototype.remainingColors = {};
Level.prototype.addToRemainingColors = function(word) {
  if (!this.remainingColors[word.text]) {
    this.remainingColors[word.text] = 1;
  } else {
    this.remainingColors[word.text]++;
  }
};

Level.prototype.removeFromRemainingColors = function(word) {
  this.remainingColors[word.text]--;
};

Level.prototype.addPointsToPool = function() {
    var points = this.game.add.text(0, 0, '');
    points.exists = false;
    points.visible = false;
    points.anchor = {x: 0.5, y: 0.5};
    this.pointsPool.add(points);
    return points;
};

Level.prototype.addWordToPool = function() {
    var Word = require('../entities/word');
    var word = new Word(this.game, this, 0, 0);
    word.name = 'word'+this.wordsPool.length;
    this.wordsPool.add(word);
    return word;
};

Level.prototype.placeWord = function(x, y) {
    // Get a dead word from the pool
    var word = this.wordsPool.getFirstDead();
    if (word === null) {
        // console.log("increasing word pool to", this.wordsPool.length);
        word = this.addWordToPool();
    }
    word.init();
    word.reset(x, y);
    this.addToRemainingColors(word);
    word.revive();

    // console.log("placing word", word.name, word.text, x, y)

    return word;
};

Level.prototype.assignRandomColor = function(){
  return this.rnd.pick(this.game.currentLevel.activeColors);
}

Level.prototype.buildWordGrid = function() {
  var x = 0;
  var y = 5;
  var wordHeight = 0;
  var currentWord;
  function isStillVeritcalSpace(word) {return y + wordHeight < this.game.height;}
  function wordOverlaps(word) {
    var overlap = Math.max(0, x + word.width - this.game.width);
    var percentCutOff = 100 * overlap / word.width;
    return percentCutOff > 50;
  }
  while (isStillVeritcalSpace.call(this)) {
    currentWord = this.placeWord(x, y);
    wordHeight = currentWord.height * 0.5;
    if (wordOverlaps.call(this, currentWord)) {
      x = 0;
      y += currentWord.height;
      if (isStillVeritcalSpace.call(this)) {
        currentWord.reset(x,y);
      } else {
        this.removeFromRemainingColors(currentWord);
        currentWord.destroy();
      }
    }
    x += currentWord.width;
  }
};

Level.prototype.startLevel = function () {
  var numAnimationsComplete = 0;
  var cb = function() {
    numAnimationsComplete++;
    if(numAnimationsComplete === this.wordsPool.length) {
      // when starting animation is finished, start first round
      // give a brief pause first
      this.game.time.events.add(1200, this.queueNextRound, this);
    }
  }.bind(this);
  this.wordsPool.callAll("flashWord", null, cb);
};

Level.prototype.highlightRandomWord = function() {
  this.targetWord = this.wordsPool.getRandom();
  if(!this.targetWord.alive) {
    console.error('WORD IS DEAD');
  }
  this.targetColorWord = this.getRandomAvailableColor();
  this.targetColorHex = this.game.COLORS[this.targetColorWord];
  this.targetWord.highlight(this.targetColorHex);
};

Level.prototype.endRound = function (selectedWord, keepInPlay) {

  this.roundIsOver = true;
  this.roundTimerTween.stop();
  this.targetWord.resetWord();

  var cb;

  // round outcome logic
  if (selectedWord === null) {
    // word missed
    cb = function () {
      this.missedWordsPool.add(this.targetWord); // auto removes from wordsPool
      this.queueNextRound();
    }.bind(this);
    this.feedbackWrong();
    this.targetWord.feedbackWrong(cb);
    this.game.score.wrong();

  } else if (this.playIsCorrect(selectedWord)) {
    // right
    if(keepInPlay) {
      if(this.game.levelManager.currentLevel >= 4) {
        // level challenge 4+ - words turn upside odwn
        selectedWord.bitmapText.angle = 180;
        selectedWord.bitmapText.x += selectedWord.bitmapText.textWidth;
        selectedWord.bitmapText.y += selectedWord.bitmapText.textHeight/2;
      }
      this.game.time.events.add(1000, this.queueNextRound, this);
      return
    }

    cb = function () {
      this.wordsPool.remove(selectedWord);
      this.queueNextRound();
    }.bind(this);

    this.feedbackCorrect();
    selectedWord.feedbackCorrect(cb);
    var prevMultiplier = this.game.score.scoreMultiplier;
    var points = this.game.score.correct(this.wordScore, this.roundTimer.timeRemaining);
    // show earned points feedback
    this.feedbackScore(points, selectedWord);
    // show multiplier if increased
    if (prevMultiplier < this.game.score.scoreMultiplier) {
      this.feedbackMultiplier(this.game.score.scoreMultiplier, selectedWord);
    }

  } else {
    // wrong
    cb = function () {
      this.missedWordsPool.add(selectedWord); // auto removes from wordsPool
      this.queueNextRound();
    }.bind(this);

    this.feedbackWrong();
    selectedWord.feedbackWrong(cb);
    this.game.score.wrong();
  }
};

Level.prototype.queueNextRound = function() {
  if (this.checkIsGameOver()) {
    console.log('level over')
    this.doGameOver();
  } else {
    // console.log("start round", this.roundNumber++);
    this.roundIsOver = false;

    // round timer (1 -> 0)
    // all other factors of the round time (target word
    // fade out, score) use roundtimer
    this.roundTimer = {timeRemaining: 1};
    this.roundTimerTween = this.game.add.tween(this.roundTimer);
    this.roundTimerTween.to({timeRemaining: 0}, this.game.currentLevel.roundDuration);
    this.roundTimerTween.start();

    // update factors depending on round timer
    this.roundTimerTween.onUpdateCallback(function(){
        // fade out target word
        this.targetWord.alpha = this.roundTimer.timeRemaining;
        // decrease score as time passes
    }, this);

    // when the wround ends
    this.roundTimerTween.onComplete.add(function () {
      // if the round ends, it means the player
      // didn't click anyw word, so send null
      this.endRound(null);
      this.targetWord.doMissed();
    }, this);

    this.highlightRandomWord();
  }
};

Level.prototype.getRandomAvailableColor = function() {
  var remainingColors = [];
  for (var colorName in this.remainingColors) {
    if (this.remainingColors[colorName] > 0) {
      remainingColors.push(colorName);
    }
  }
  return this.rnd.pick(remainingColors);
}

Level.prototype.playIsCorrect = function(selectedWord) {
  return selectedWord.text.toLowerCase() === this.targetColorWord.toLowerCase();
};

Level.prototype.checkIsGameOver = function() {
  return this.wordsPool.length === 0;
};

Level.prototype.doGameOver = function() {
  this.game.state.start('levelEnd');
};

Level.prototype.feedbackWrong = function() {
  // shake the world
  var shakeWorld = {progress: 0};
  var amp = 7;
  var speed = 150;
  var repeat = 1;
  var t = this.game.add.tween(shakeWorld).to({progress: 2 * Math.PI}, speed, null, true, 0, repeat);
  t.onUpdateCallback(function(tween, p) {
    this.wordsPool.x = amp * Math.sin(shakeWorld.progress);
  }, this);
};

Level.prototype.flashScreen = function() {
  // flash the target color
  var flash = {progress: 0};
  var finalBrightness = 0.5;
  var speed = 200;
  var repeat = 1;
  var r = Phaser.Color.getRed(this.targetColorHex);
  var g = Phaser.Color.getGreen(this.targetColorHex);
  var b = Phaser.Color.getBlue(this.targetColorHex);
  var t = this.game.add.tween(flash).to({progress: finalBrightness}, speed, null, true, 0, repeat, true);
  t.onUpdateCallback(function(tween, p) {
    this.game.stage.backgroundColor = Phaser.Color.getColor(r * flash.progress,g * flash.progress,b * flash.progress);
  }, this);
};

Level.prototype.feedbackCorrect = function() {
  // no effect
};

Level.prototype.feedbackScore = function (points, selectedWord) {
  var pointsFeedback = this.pointsPool.getFirstExists(false);
  pointsFeedback.setStyle({ font: '26px Arial', fill: '#fff', align: 'center'});
  pointsFeedback.x = selectedWord.x - pointsFeedback.width / 2 + selectedWord.width / 2;
  pointsFeedback.y = selectedWord.y;
  pointsFeedback.setText("+"+points);
  pointsFeedback.exists = true;
  pointsFeedback.visible = true;
  pointsFeedback.alpha = 0.6;
  var pointsTween = this.game.add.tween(pointsFeedback);
  pointsTween.to({y: pointsFeedback.y - 50, alpha: 0}, 900, null, true);
  pointsTween.onComplete.add(function(){
    this.exists = false;
    this.visible = false;
    this.alpha = 0.6;
  }, pointsFeedback);
};

Level.prototype.multiplierColors = [
  "white",
  "blue",
  "green",
  "red",
  "purple",
  "orange",
  "yellow",
  "pink",
  "brown",
];

Level.prototype.feedbackMultiplier = function (multiplier, selectedWord) {
  var multiplierFeedback = this.pointsPool.getFirstExists(false);
  multiplierFeedback.setStyle({ font: 'bold 36px Arial', fill: '#fff', align: 'center'});
  multiplierFeedback.tint = this.game.COLORS[this.multiplierColors[this.game.score.scoreMultiplier - 1]];
  multiplierFeedback.x = selectedWord.x - multiplierFeedback.width / 2 + selectedWord.width / 4;
  multiplierFeedback.y = selectedWord.y;
  multiplierFeedback.setText("X"+multiplier);
  multiplierFeedback.exists = true;
  multiplierFeedback.visible = true;
  multiplierFeedback.alpha = 0.6;
  multiplierFeedback.scale = {x: 1, y: 1};
  var multiplierTween = this.game.add.tween(multiplierFeedback);
  multiplierTween.to({y: multiplierFeedback.y - 20, alpha: 0}, 900, null, true);
  this.game.add.tween(multiplierFeedback.scale).to({x: 2, y: 2}, 900, null, true);
  multiplierTween.onComplete.add(function(){
    this.exists = false;
    this.visible = false;
    this.alpha = 0.6;
    this.scale = {x: 1, y: 1};
  }, multiplierFeedback);
};

Level.prototype.update = function() {
    if (this.game.time.fps !== 0) {
        this.fpsText.setText(this.game.time.fps + ' FPS');
    }
};

Level.prototype.render = function render() {
    // this.wordsPool.forEach(function(word){this.game.debug.spriteBounds(word);window.word = word;},this);
};

Level.prototype.shutdown = function() {  
  this.wordsPool.destroy();
}

});

;