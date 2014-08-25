module.exports = Word = function(game, gameState, x, y) {
    this.gameState = gameState;
    this.bitmap = game.add.bitmapData(game.width,game.height); // width and height get reset after word size is calculated

    // call super
    Phaser.Sprite.call(this, game, x, y, this.bitmap);

    // set up instance props upon creation (vs upon revive)
    this.kill();
    this.inputEnabled = true;
    this.events.onInputDown.add(this.tapWord, this);
};
Word.prototype = Object.create(Phaser.Sprite.prototype);
Word.prototype.constructor = Word;

// set up instance props upon revive
Word.prototype.init = function() {
    this.text = this.gameState.assignRandomColor();
    this.fontSize = 25;
    this.resizeToText();
    this.renderWordTexture(this.text, '#444');
}

Word.prototype.renderWordTexture = function(text, color) {
    this.bitmap.context.clearRect(0, 0, this.width, this.height);
    this.bitmap.context.fillStyle = color;
    this.bitmap.context.fillText(text.toUpperCase(), this.bitmap.width / 2, this.bitmap.height / 2);

    this.bitmap.dirty = true;
    this.bitmap.render()
};

Word.prototype.setFontContext = function() {
    this.bitmap.context.font = "bold " + this.fontSize + "px  Arial Black, Arial";
    this.bitmap.context.textAlign = 'center';
    this.bitmap.context.textBaseline = 'middle';
}

Word.prototype.resizeToText = function() {
    this.setFontContext(); // to make sure we measure the right size
    // width and height include some padding
    var width = this.bitmap.context.measureText("M" + this.text.toUpperCase()).width;
    var height = this.fontSize * 1.5;
    this.bitmap.resize(width,height);
    this.setFontContext(); // resize() resets context, so we need to reapply
    // set sprite size to new context size
    this.crop({x: 0, y: 0, width: width, height: height});
}

Word.prototype.tapWord = function(){
  console.log("tapped on ", this.name, this.text);
  this.renderWordTexture(this.text, this.text);
}

Word.prototype.update = function() {
};

