module.exports = GameState = function(game) {
};

// Load images and sounds
GameState.prototype.preload = function() {
    this.game.scale.startFullScreen();
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; //resize your window to see the stage resize too
    // this.game.scale.forceOrientation(false, true, '/portrait-only.jpg');
    this.game.scale.refresh();
};

// Set up the game and kick it off
GameState.prototype.create = function() {
    this.game.stage.backgroundColor = 0 * 0xFFFFFF;

    // game props
    this.COLORS = ['red','orange','green','blue','purple'];
    this.roundDuration = 2000;
    this.highlightDuration = 1000;
    this.targetColorHex = 0xFFFFFF;
    this.targetColorWord = "white";

    this.wordsPool = this.game.add.group();
    // start words pool with 10 objects
    for(var i = 0; i < 10; i++) {
        this.addWordToPool();
    }
    
    // Show FPS
    // this.game.time.advancedTiming = true;
    // this.fpsText = this.game.add.text(
    //     20, 20, '', { font: '16px Arial', fill: '#ffffff' }
    // );

    this.buildWordGrid();
    this.game.time.events.add(this.roundDuration, this.hightlighRandomWord, this);
};

GameState.prototype.colorMap = {
  'red': 0xFF0000,
  'orange': 0xFF9900,
  'green': 0x33FF00,
  'blue': 0x33333FF,
  'purple': 0x993399
}

GameState.prototype.remainingColors = {};
GameState.prototype.addToRemainingColors = function(word) {
  if (!this.remainingColors[word.text]) {
    this.remainingColors[word.text] = 1;
  } else {
    this.remainingColors[word.text]++;
  }
};

GameState.prototype.removeFromRemainingColors = function(word) {
  this.remainingColors[word.text]--;
};


GameState.prototype.addWordToPool = function() {
    var Word = require('../entities/word');
    var word = new Word(this.game, this, 0, 0);
    word.name = 'word'+this.wordsPool.length;
    this.wordsPool.add(word);
    return word;
};

GameState.prototype.placeWord = function(x, y) {
    // Get a dead word from the pool
    var word = this.wordsPool.getFirstDead();
    if (word === null) {
        // console.log("increasing word pool to", this.wordsPool.length);
        word = this.addWordToPool();
    }
    word.init();
    this.addToRemainingColors(word);
    word.revive();
    word.reset(x, y);

    // console.log("placing word", word.name, word.text, x, y)

    return word;
};

GameState.prototype.assignRandomColor = function(){
  return this.rnd.pick(this.COLORS);
}

GameState.prototype.buildWordGrid = function() {
  var isStillSpace = true;
  var lastWord;
  var x = y = 0;
  while (isStillSpace) {
    lastWord = this.placeWord(x, y);
    x += lastWord.width;
    if (x > this.game.width) {
      x = 0;
      y += lastWord.height;
      if (y + lastWord.height > this.game.height) {
        isStillSpace = false;
      }
    }
  }
};

GameState.prototype.hightlighRandomWord = function() {
  var targetWord = this.wordsPool.getRandom();
  this.targetColorWord = this.getRandomAvailableColor();
  this.targetColorHex = this.colorMap[this.targetColorWord];
  targetWord.highlight(this.targetColorHex, this.highlightDuration);
  this.game.time.events.add(this.roundDuration, this.hightlighRandomWord, this);
};

GameState.prototype.getRandomAvailableColor = function() {
  var remainingColors = [];
  for (var colorName in this.remainingColors) {
    if (this.remainingColors[colorName] > 0) {
      remainingColors.push(colorName);
    }
  }
  return this.rnd.pick(remainingColors);
}

GameState.prototype.checkIsGameOver = function(word) {
  return false;
};

GameState.prototype.doGameOver = function() {
};

GameState.prototype.flashBackground = function() {
  // FIXME this can be moved to where the background is defined
  this.flashBackgroundTween = game.add.tween(this.game.stage);
  this.flashBackgroundTween.to({backgroundColor: 0.8 * 0xFFFFFF}, 100, null, true, 0, 1, true);
};

GameState.prototype.update = function() {
    if (this.game.time.fps !== 0) {
        this.fpsText.setText(this.game.time.fps + ' FPS');
    }
};

GameState.prototype.render = function render() {
    // this.wordsPool.forEach(function(word){this.game.debug.spriteInfo(word);window.word = word;},this);
};
