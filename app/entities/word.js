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
    this.game.currentLevel.fontSize = 70;
    this.bitmapText = this.game.add.bitmapText(this.x, this.y, 'cbbfont', 'N', this.game.currentLevel.fontSize);
    this.textSpacing = this.bitmapText.textWidth;
    this.text = this.level.assignRandomColor();
    this.bitmapText.setText(this.text.toUpperCase());
    this.bitmapText.updateText();
    this.addChild(this.bitmapText);
    this.bitmapText.tint = 0x444444;
    this.resizeToText();
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
  this.outOfPlay();
  this.level.endRound(this);
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

