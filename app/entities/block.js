module.exports = Block = function(game, gameState, x, y) {

    this.BLOCKSIZE = gameState.BLOCKSIZE;

    this.gameState = gameState;

    this.bitmap = game.add.bitmapData(this.BLOCKSIZE,this.BLOCKSIZE);

    Phaser.Sprite.call(this, game, x, y, this.bitmap);
    
    this.init();

    // Enable physics on the block
    game.physics.enable(this, Phaser.Physics.ARCADE);

    // Set its initial state to "dead".
    this.kill();

    this.body.bounce.y = 0.1;

    this.MAX_SPEED = 50; // pixels/second

    this.inputEnabled = true;
    this.events.onInputDown.add(this.tapBlock, this);

};


Block.prototype = Object.create(Phaser.Sprite.prototype);
Block.prototype.constructor = Block;


Block.prototype.init = function() {
    // color is the actual color
    this.color = this.gameState.assignRandomeColor();
    // decoyColor is the is the rendered color
    this.decoyColor = this.gameState.assignRandomeColor();
    
    this.renderBlockTexture(this.decoyColor, this.color);
}

Block.prototype.renderBlockTexture = function(decoyColor, text) {
    this.bitmap.context.fillStyle = "black";
    this.bitmap.context.fillRect(0,0,this.BLOCKSIZE,this.BLOCKSIZE);

    function strokeBlock(color, lineWidth) {
      this.bitmap.context.strokeStyle = color;
      this.bitmap.context.lineWidth = lineWidth;
      this.bitmap.context.strokeRect(0, 0, this.BLOCKSIZE, this.BLOCKSIZE);
    }

    strokeBlock.call(this, decoyColor, 6);
    strokeBlock.call(this, "#333", 1);

    // write color
    this.bitmap.context.fillStyle = decoyColor;
    this.bitmap.context.font = "16px Arial";
    this.bitmap.context.textAlign = 'center';
    this.bitmap.context.textBaseline = 'middle';
    this.bitmap.context.fillText(text, this.BLOCKSIZE / 2, this.BLOCKSIZE / 2);

    this.bitmap.dirty = true;
    this.bitmap.render()
};

// Block movements
Block.prototype.update = function() {

};


Block.prototype.land = function() {
  // hacky way to let a block bounce once then stop
  // gets around bug(?) where stacked blocks bounce slightly
  // and fall through when stacks get to "heavy"
  if (this.bounced) {
      this.bounced = false;
      this.body.velocity.y = 0;
      this.body.immovable = true;
      this.body.allowGravity = false;
      this.renderBlockTexture('gray', this.color);
  } else {
      this.bounced = true;
  }
};

Block.prototype.hitGround = function() {
  if (this.color === this.gameState.ground.color) {
    this.land();
  } else {
    this.kill();
  }
}

Block.prototype.tapBlock = function(){
  if (!this.body.allowGravity) {
      // can't tab blocks that have already landed
      return;
  } else {
    this.kill();
  }
  if (this.body.allowGravity && this.color === this.gameState.ground.color) {
    // correct
  } else {
   // wrong!
    this.gameState.ground.color = this.color;
    this.gameState.ground.drawGround();
  }
}
