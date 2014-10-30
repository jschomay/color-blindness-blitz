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
    this.fontSize = 39;
    this.textSpacing = 25;
    this.text = this.level.assignRandomColor();
    this.bitmapText = game.add.bitmapText(this.x, this.y, 'cbbfont', this.text.toUpperCase(), this.fontSize);
    this.addChild(this.bitmapText);
    this.bitmapText.tint = 0x444444;
    this.resizeToText();
    this.frozen = false;
    this.highlightTween = null;
};

Word.prototype.setFontContext = function() {
    this.bitmap.context.font = "bold " + this.fontSize + "px  Arial Black, Arial";
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

Word.prototype.removeFromGame = function () {
  this.level.removeFromRemainingColors(this);
  this.level.missedWordsPool.add(this); // auto removes from wordsPool
  this.freeze();
};

Word.prototype.tapWord = function(){
  if (this.level.roundIsOver || this.frozen) {
    return;
  }

  // round outcome logic
  if (this.playIsCorrect()) {
    // right
    console.log('correct')
    this.game.score.correct++;
    this.level.removeFromRemainingColors(this);
    this.kill();
    this.level.wordsPool.remove(this);
    // speed up
    this.level.roundDuration *= this.game.pacing.roundSpeedIncrease
    this.level.nextRoundDelay *= this.game.pacing.roundSpeedIncrease
  } else {
    // wrong
    console.log('wrong')
    this.level.showWrong();
    this.removeFromGame();
    // slow down
    this.level.roundDuration *= 1/this.game.pacing.roundSpeedIncrease
    this.level.nextRoundDelay *= 1/this.game.pacing.roundSpeedIncrease
  }

  // end current round
  this.level.targetWord.highlightTween.stop();
  this.level.targetWord.highlightTween = null;
  this.level.targetWord.resetWord();

  // queue next round
  this.level.queueNextRound();
};

Word.prototype.freeze = function() {
  this.frozen = true;
  this.bitmapText.tint = 0xffffff;
};

Word.prototype.playIsCorrect = function() {
  return this.text.toLowerCase() === this.level.targetColorWord.toLowerCase();
};

// highlights the word and immediately start fading it out over the round duration
Word.prototype.highlight = function(color) {
  this.bitmapText.tint = color;

  // add new fadeout tween (cant reuse same tween
  // because sometimes it wont start, must be a bug)
  this.highlightTween = game.add.tween(this);
  this.highlightTween.to({ alpha: 0.1}, this.level.roundDuration);
  this.highlightTween.onComplete.add(function () {
    // player was too slow
    console.log('too slow!')
    this.level.showWrong();
    this.level.targetWord.resetWord();
    this.level.targetWord.removeFromGame()
    this.level.queueNextRound();
  }, this);
  this.highlightTween.start();
}

Word.prototype.update = function() {
};

Word.prototype.getHexColor = function() {
  return this.level.colorMap[this.text];
}

