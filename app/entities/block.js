module.exports = Block = function(game, gameState, x, y) {

    this.BLOCKSIZE = gameState.BLOCKSIZE;

    this.bitmap = game.add.bitmapData(this.BLOCKSIZE,this.BLOCKSIZE);

    Phaser.Sprite.call(this, game, x, y, this.bitmap);

    this.color = game.rnd.pick(['red','orange','yellow','green','blue','purple']);
    this.drawColor = game.rnd.pick(['red','orange','yellow','green','blue','purple']);
    this.drawBlock();
    
    this.scale.x = 1;
    this.scale.y = 1;

    // Enable physics on the block
    game.physics.enable(this, Phaser.Physics.ARCADE);

    // Set its initial state to "dead".
    this.kill();

    this.body.bounce.y = 0.1;
    this.body.checkWorldBounds = true;
    this.body.outOfBoundsKill = true;

    this.MAX_SPEED = 50; // pixels/second


};

Block.prototype = Object.create(Phaser.Sprite.prototype);
Block.prototype.constructor = Block;

Block.prototype.drawBlock = function() {
    this.bitmap.context.fillStyle = "black";
    this.bitmap.context.fillRect(0,0,this.BLOCKSIZE,this.BLOCKSIZE);

    function strokeBlock(color, lineWidth) {
      this.bitmap.context.strokeStyle = color;
      this.bitmap.context.lineWidth = lineWidth;
      this.bitmap.context.strokeRect(0, 0, this.BLOCKSIZE, this.BLOCKSIZE);
    }

    strokeBlock.call(this, this.drawColor, 6);
    strokeBlock.call(this, "#333", 1);

    // write color
    this.bitmap.context.fillStyle = this.drawColor;
    this.bitmap.context.font = "16px Arial";
    this.bitmap.context.textAlign = 'center';
    this.bitmap.context.textBaseline = 'middle';
    this.bitmap.context.fillText(this.color, this.BLOCKSIZE / 2, this.BLOCKSIZE / 2);

    this.bitmap.dirty = true;
};

// Block movements
Block.prototype.update = function() {

};
