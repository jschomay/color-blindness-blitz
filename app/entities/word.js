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
    this.text = this.level.assignRandomColor();
    this.bitmapText = game.add.bitmapText(this.x, this.y, 'cbbfont', this.text.toUpperCase(), this.fontSize);
    this.addChild(this.bitmapText);
    this.bitmapText.tint = 0x444444;
    this.highlightTimeout = undefined;
    this.resizeToText();
    this.frozen = false;
}

Word.prototype.setFontContext = function() {
    this.bitmap.context.font = "bold " + this.fontSize + "px  Arial Black, Arial";
    this.bitmap.context.textAlign = 'center';
    this.bitmap.context.textBaseline = 'middle';
}

Word.prototype.resizeToText = function() {
    this.crop({x: 0, y: 0, width: this.bitmapText.textWidth * 1.2, height: this.bitmapText.textHeight});
}

Word.prototype.tapWord = function(){
  if (this.level.roundIsOver || this.frozen) {
    return;
  }
  this.level.resetHighlightedWord();
  this.level.removeFromRemainingColors(this);

  // round outcome logic
  if (this.playIsCorrect()) {
    // right
    this.game.score.correct++;
    this.kill();
    this.level.wordsPool.remove(this);
    // speed up
    this.level.roundDuration *= this.game.pacing.roundSpeedIncrease
    this.level.nextRoundDelay *= this.game.pacing.roundSpeedIncrease
  } else {
    // wrong
    this.level.showWrong();
    this.freeze();
    // slow down
    this.level.roundDuration *= 1/this.game.pacing.roundSpeedIncrease
    this.level.nextRoundDelay *= 1/this.game.pacing.roundSpeedIncrease
  }

  // end current round
  this.game.time.events.remove(this.level.roundTimeout);

  // queue next round
  this.level.queueNextRound();
};

Word.prototype.freeze = function() {
  this.frozen = true;
  this.bitmapText.tint = 0xffffff;
  this.level.missedWordsPool.add(this); // auto removces from wordsPool
};

Word.prototype.playIsCorrect = function() {
  return this.text.toLowerCase() === this.level.targetColorWord.toLowerCase();
};

Word.prototype.highlight = function(color, duration) {
  var previousTint = this.bitmapText.tint;
  this.bitmapText.tint = color;
  this.level.roundTimeout = this.game.time.events.add(duration, function(){
    this.bitmapText.tint = previousTint
    // player was too slow
    this.level.resetHighlightedWord();
    this.level.removeFromRemainingColors(this.level.targetWord);
    this.level.showWrong();
    this.level.targetWord.freeze();
    this.level.queueNextRound();
  }, this);
  // FIXME tweening the tint doesn't work well at all
  // try doing it in the canvas with hsl and desaturation
  // var highlightTween = game.add.tween(this);
  // highlightTween.to({ tint: color}, 1);
  // highlightTween.start();
  // if (duration >= 0) {
  //   this.game.time.events.add(duration, this.highlight, this, previousTint, -1);
  // }
}

Word.prototype.update = function() {
};

Word.prototype.getHexColor = function() {
  return this.level.colorMap[this.text];
}

