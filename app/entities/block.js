module.exports = Block = function(game, gameState, x, y) {

    this.BLOCKSIZE = gameState.BLOCKSIZE;

    this.bitmap = game.add.bitmapData(this.BLOCKSIZE,this.BLOCKSIZE);

    Phaser.Sprite.call(this, game, x, y, this.bitmap);

    this.color = game.rnd.pick(['red','orange','yellow','green','blue','purple']);
    this.drawColor = game.rnd.pick(['red','orange','yellow','green','blue','purple']);
    this.drawBlock(this.drawColor, this.color);
    
    this.scale.x = 1;
    this.scale.y = 1;

    // Enable physics on the block
    game.physics.enable(this, Phaser.Physics.ARCADE);

    // Set its initial state to "dead".
    this.kill();

    this.body.bounce.y = 0.1;

    this.MAX_SPEED = 50; // pixels/second


};

Block.prototype = Object.create(Phaser.Sprite.prototype);
Block.prototype.constructor = Block;

Block.prototype.drawBlock = function(drawColor, text) {
    this.bitmap.context.fillStyle = "black";
    this.bitmap.context.fillRect(0,0,this.BLOCKSIZE,this.BLOCKSIZE);

    function strokeBlock(color, lineWidth) {
      this.bitmap.context.strokeStyle = color;
      this.bitmap.context.lineWidth = lineWidth;
      this.bitmap.context.strokeRect(0, 0, this.BLOCKSIZE, this.BLOCKSIZE);
    }

    strokeBlock.call(this, drawColor, 6);
    strokeBlock.call(this, "#333", 1);

    // write color
    this.bitmap.context.fillStyle = drawColor;
    this.bitmap.context.font = "16px Arial";
    this.bitmap.context.textAlign = 'center';
    this.bitmap.context.textBaseline = 'middle';
    this.bitmap.context.fillText(text, this.BLOCKSIZE / 2, this.BLOCKSIZE / 2);

    this.bitmap.dirty = true;
};

// Block movements
Block.prototype.update = function() {

};


Block.prototype.land = function() {
  // hacky way to let a block bounce once then stop
  // gets around bug(?) where stacked blocks bounce slightly
  // and fall through when stacks get to "heavy"
  if (this.bounced) {
      this.body.velocity.y = 0;
      this.body.immovable = true;
      this.body.allowGravity = false;
  } else {
      this.bounced = true;
      this.drawBlock('gray', '');
  }
};

Block.prototype.hitGround = function(ground) {
  if (this.color === ground.color) {
    this.land();
  } else {
    this.kill();
  }
}
