module.exports = Level = function(game) {
};

// Load images and sounds
Level.prototype.preload = function() {
    this.game.scale.startFullScreen();
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; //resize your window to see the stage resize too
    // this.game.scale.forceOrientation(false, true, '/portrait-only.jpg');
    this.game.scale.refresh();

    this.load.bitmapFont('cbbfont', 'CBB/CBB.png', 'CBB/CBB.fnt');  

};

// Set up the game and kick it off
Level.prototype.create = function() {
    this.game.stage.backgroundColor = 0 * 0xFFFFFF;

    // game props
    this.COLORS = ['red','orange','green','blue','purple'];
    this.roundNumber = 1;
    this.roundDuration = 3000 * this.game.pacing.baseSpeedMultiplier;
    this.nextRoundDelay = 1000 * this.game.pacing.baseSpeedMultiplier;
    this.roundTimeout = undefined;
    this.targetWord = undefined;
    this.targetColorHex = 0xFFFFFF;
    this.targetColorWord = "white";
    this.roundIsOver = true;

    this.wordsPool = this.game.add.group();
    this.missedWordsPool = this.game.add.group();
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
    this.game.score.total = this.wordsPool.length;
    this.highlightRandomWord();
};

Level.prototype.colorMap = {
  'red': 0xFF0000,
  'orange': 0xFF9900,
  'green': 0x33FF00,
  'blue': 0x3333FF,
  'purple': 0x993399
}

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
  return this.rnd.pick(this.COLORS);
}

Level.prototype.buildWordGrid = function() {
  var isStillSpace = true;
  var lastWord;
  var x = y = 0;
  while (isStillSpace) {
    lastWord = this.placeWord(x, y);
    x += lastWord.width;
    if (x + lastWord.width / 4 > this.game.width) {
      x = 0;
      y += lastWord.height;
      if (y + lastWord.height > this.game.height) {
        isStillSpace = false;
      }
    }
  }
};

Level.prototype.highlightRandomWord = function() {
  // console.log("start round", this.roundNumber++);
  if (this.wordsPool.length < 1)
    return;

  this.roundIsOver = false;
  this.targetWord = this.wordsPool.getRandom();
  this.targetColorWord = this.getRandomAvailableColor();
  this.targetColorHex = this.colorMap[this.targetColorWord];
  this.targetWord.highlight(this.targetColorHex, this.roundDuration);
};

Level.prototype.resetHighlightedWord = function() {
  this.targetWord.bitmapText.tint = 0x444444;
};

Level.prototype.queueNextRound = function() {
  this.roundIsOver = true;
  if (this.checkIsGameOver()) {
    this.doGameOver();
  } else {
    this.game.time.events.add(this.nextRoundDelay, this.highlightRandomWord, this);
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

Level.prototype.checkIsGameOver = function() {
  return this.wordsPool.length === 0;
};

Level.prototype.doGameOver = function() {
  // speed up next round
  this.game.pacing.baseSpeedMultiplier *= this.game.pacing.levelSpeedIncrease;
  this.game.pacing.level++;
  this.game.state.start('levelEnd');
};

Level.prototype.showWrong = function() {
  // FIXME this can be moved to where the background is defined
  // var color = 0xFFFFFF;
  var color = this.targetColorHex;
  this.flashBackgroundTween = game.add.tween(this.game.stage);
  this.flashBackgroundTween.to({backgroundColor: color}, 100, null, true, 0, 3, true);
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
