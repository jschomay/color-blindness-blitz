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
