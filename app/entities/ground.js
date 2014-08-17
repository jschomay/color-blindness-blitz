module.exports = Ground = function(game, gameState, y) {

    var height = 30;
    this.bitmap = game.add.bitmapData(game.width, height);

    Phaser.Sprite.call(this, game, 0, y, this.bitmap);

    this.color = gameState.assignRandomeColor();
    this.drawGround();
    
    // Enable physics on the block
    game.physics.enable(this, Phaser.Physics.ARCADE);

    this.body.immovable = true;
    this.body.allowGravity = false;
    this.body.enable = false;
};

Ground.prototype = Object.create(Phaser.Sprite.prototype);
Ground.prototype.constructor = Ground;

Ground.prototype.drawGround = function() {
    this.bitmap.context.fillStyle = this.color;
    this.bitmap.context.fillRect(0,0,this.game.width,this.height);

    function strokeBlock(color, lineWidth) {
      this.bitmap.context.strokeStyle = color;
      this.bitmap.context.lineWidth = lineWidth;
      this.bitmap.context.strokeRect(0, 0, this.game.width, this.height);
    }

    strokeBlock.call(this, this.color, 15);
    strokeBlock.call(this, "#333", 1);

    this.bitmap.dirty = true;
};

// Block movements
Ground.prototype.update = function() {

};



