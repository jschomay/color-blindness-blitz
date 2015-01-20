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
    this.COLORS = ['red','orange','green','blue','purple', 'brown', 'pink', 'yellow'];
    this.roundNumber = 1;
    this.roundDuration = 3000 * this.game.pacing.baseSpeedMultiplier;
    this.wordScoreTween = null;
    this.wordScore = {score: this.game.pacing.wordScore};
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

    this.game.score.startLevel();

    // start the game!
    this.queueNextRound();
};

Level.prototype.colorMap = {
  'red': 0xFF0000,
  'orange': 0xFFAD32,
  'green': 0x33FF00,
  'blue': 0x3333FF,
  'purple': 0x800080,
  'brown': 0x663610,
  'pink': 0xFF7BCB,
  'yellow': 0xFEFF00
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
  var x = 0;
  var y = 5;
  function isStillVeritcalSpace() {return y < this.game.height};
  function wordOverlaps(word) {
    var overlap = Math.max(0, x + word.width - this.game.width);
    var percentCutOff = 100 * overlap / word.width;
    return percentCutOff > 50;
  }
  while (isStillVeritcalSpace()) {
    currentWord = this.placeWord(x, y);
    if (wordOverlaps(currentWord)) {
      x = 0;
      y += currentWord.height;
      if (isStillVeritcalSpace()) {
        currentWord.reset(x,y);
      } else {
        this.removeFromRemainingColors(currentWord);
        currentWord.destroy();
      }
    }
    x += currentWord.width;
  }
};

Level.prototype.highlightRandomWord = function() {
  this.targetWord = this.wordsPool.getRandom();
  if(!this.targetWord.alive) {
    console.error('WORD IS DEAD');
  }
  this.targetColorWord = this.getRandomAvailableColor();
  this.targetColorHex = this.colorMap[this.targetColorWord];
  this.targetWord.highlight(this.targetColorHex);
};

Level.prototype.endRound = function (selectedWord) {

  this.roundIsOver = true;
  this.wordScoreTween.stop();
  this.targetWord.highlightTween.stop();
  this.targetWord.highlightTween = null;
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
    cb = function () {
      this.wordsPool.remove(selectedWord);
      this.queueNextRound();
    }.bind(this);

    this.feedbackCorrect();
    selectedWord.feedbackCorrect(cb);
    this.game.score.correct(this.wordScore.score);
    // speed up
    this.roundDuration *= this.game.pacing.roundSpeedIncrease

  } else {
    // wrong
    cb = function () {
      this.missedWordsPool.add(selectedWord); // auto removes from wordsPool
      this.queueNextRound();
    }.bind(this);

    this.feedbackWrong();
    selectedWord.feedbackWrong(cb);
    this.game.score.wrong();
    // slow down
    this.roundDuration *= 1/this.game.pacing.roundSpeedIncrease
  }
};

Level.prototype.queueNextRound = function() {
  if (this.checkIsGameOver()) {
    console.log('level over')
    this.doGameOver();
  } else {
    // console.log("start round", this.roundNumber++);
    this.roundIsOver = false;

    // decrease word score the longer it takes
    this.wordScore = {score: this.game.pacing.wordScore};
    this.wordScoreTween = this.game.add.tween(this.wordScore);
    var minScoreFactor = 2;
    this.wordScoreTween.to({ score: 0}, this.roundDuration * minScoreFactor);
    this.wordScoreTween.start();

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
  // speed up next round
  this.game.pacing.baseSpeedMultiplier *= this.game.pacing.levelSpeedIncrease;
  this.game.pacing.level++;
  this.game.state.start('levelEnd');
};

Level.prototype.feedbackWrong = function() {
  // shake the world
  var shakeWorld = {progress: 0};
  var amp = 7;
  var speed = 150;
  var repeat = 1;
  var t = game.add.tween(shakeWorld).to({progress: 2 * Math.PI}, speed, null, true, 0, repeat);
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
  var t = game.add.tween(flash).to({progress: finalBrightness}, speed, null, true, 0, repeat, true);
  t.onUpdateCallback(function(tween, p) {
    this.game.stage.backgroundColor = Phaser.Color.getColor(r * flash.progress,g * flash.progress,b * flash.progress);
  }, this);
};

Level.prototype.feedbackCorrect = function() {
  // no effect
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
