module.exports = Word = function(game, gameState, x, y) {
    this.gameState = gameState;

    this.bitmap = game.add.bitmapData(20,100); // TODO get size from word

    // (super)
    Phaser.Sprite.call(this, game, x, y, this.bitmap);

    // set up instance props upon creation (vs upon revive)
    this.kill();
    this.inputEnabled = true;
    this.events.onInputDown.add(this.tapWord, this);

    this.init();
};

Word.prototype = Object.create(Phaser.Sprite.prototype);
Word.prototype.constructor = Word;

// set up instance props upon revive
Word.prototype.init = function() {
    this.color = this.gameState.assignRandomColor()
    this.renderWordTexture(this.color, '#333');
}

Word.prototype.renderWordTexture = function(text, color) {
    this.bitmap.context.fillStyle = color;
    this.bitmap.context.font = "bold 18px Arial";
    this.bitmap.context.textAlign = 'center';
    this.bitmap.context.textBaseline = 'middle';
    this.bitmap.context.fillText(text, 0, 0);

    this.bitmap.dirty = true;
    this.bitmap.render()
};

Word.prototype.tapWord = function(){
}

Word.prototype.update = function() {
};

