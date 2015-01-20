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

Word.prototype.outOfPlay = function () {
  this.alive = false;
  this.level.removeFromRemainingColors(this);
};


Word.prototype.feedbackWrong = function(cb) {
  this.bitmapText.tint = this.level.targetColorHex;
  var duration = 1000;
  var ease = Phaser.Easing.Cubic.Out;
  var delay = 230;
  var t = game.add.tween(this).to({alpha: 0, angle: 360 * 2, x: this.x + 90, y: this.y + 20}, duration, ease, true, delay);
  game.add.tween(this.scale).to({x: 0, y: 0}, duration, ease, true, delay);
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
  var t = game.add.tween(this).to({alpha: 0, x: offset.x, y: offset.y}, duration, ease, true);
  game.add.tween(this.scale).to({x: 4, y: 4}, duration, ease, true);
  t.onComplete.add(cb, this);
};

Word.prototype.tapWord = function(){
  if (this.level.roundIsOver || !this.alive) {
    return;
  }
  this.outOfPlay();
  this.level.endRound(this);
};

// highlights the word and immediately start fading it out over the round duration
Word.prototype.highlight = function(color) {
  this.bitmapText.tint = color;
  this.alpha = 1;
  
  // add new fadeout tween (cant reuse same tween
  // because sometimes it wont start, must be a bug)
  this.highlightTween = game.add.tween(this);
  this.highlightTween.to({ alpha: 0}, this.level.roundDuration);
  this.highlightTween.onComplete.add(function () {
    // player was too slow
    this.outOfPlay();
    this.visible = false; // don't want to see the feedbackWrong
    this.level.endRound(null);
  }, this);
  this.highlightTween.start();
}

Word.prototype.update = function() {
};

Word.prototype.getHexColor = function() {
  return this.level.colorMap[this.text];
}

