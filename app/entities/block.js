module.exports = Block = function(game, gameState, x, y) {

    this.BLOCKSIZE = gameState.BLOCKSIZE;

    this.gameState = gameState;

    this.bitmap = game.add.bitmapData(this.BLOCKSIZE,this.BLOCKSIZE);

    Phaser.Sprite.call(this, game, x, y, this.bitmap);

    // Enable physics on the block
    game.physics.enable(this, Phaser.Physics.ARCADE);

    // Set its initial state to "dead".
    this.kill();

    this.body.bounce.y = 0.1;
    this.body.minBounceVelocity = 0;

    this.MAX_SPEED = 50; // pixels/second

    this.inputEnabled = true;
    this.events.onInputDown.add(this.tapBlock, this);

    this.init();
};


Block.prototype = Object.create(Phaser.Sprite.prototype);
Block.prototype.constructor = Block;


Block.prototype.init = function() {
    var that = this;
    var getColor = function () {
      return that.gameState.rnd.integerInRange(0,5) >= 5 ?
        that.gameState.ground.color :
        that.gameState.assignRandomeColor()
    }

    // color is the actual color
    this.color = getColor();
    // decoyColor is the is the rendered color
    this.decoyColor = this.gameState.assignRandomeColor();

    this.renderBlockTexture('#fff');
    
    this.body.bounce.y = 0.1;
    this.body.enable = undefined;
    this.stacked = undefined;
    this.bounced = false;
}

Block.prototype.renderBlockTexture = function(backgroundColor, textColor) {

    function fillBlock (color) {
      this.bitmap.context.fillStyle = color;
      this.bitmap.context.fillRect(0,0,this.BLOCKSIZE,this.BLOCKSIZE);
    }

    function strokeBlock (color, lineWidth) {
      this.bitmap.context.strokeStyle = color;
      this.bitmap.context.lineWidth = lineWidth;
      this.bitmap.context.strokeRect(0, 0, this.BLOCKSIZE, this.BLOCKSIZE);
    }

    function renderText (text, color){
      this.bitmap.context.fillStyle = color;
      this.bitmap.context.font = "bold 18px Arial";
      this.bitmap.context.textAlign = 'center';
      this.bitmap.context.textBaseline = 'middle';
      this.bitmap.context.fillText(text, this.BLOCKSIZE / 2, this.BLOCKSIZE / 2);
    }

    // block background
    fillBlock.call(this, backgroundColor ? backgroundColor : '#aaa');
    
    // block border
    strokeBlock.call(this, "#000", 1);

    // block text
    renderText.call(this, this.decoyColor, textColor ? textColor : this.color);

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
      this.body.enable = false;
  } else {
      this.bounced = true;
      this.stacked = true;
      this.renderBlockTexture(this.decoyColor, this.decoyColor);
  }
};


Block.prototype.tapBlock = function(){
  // you can't tap a block once it has landed
  if (!this.stacked) {
    if (this.checkTap()) {
      // correct
      this.kill();
      // change ground color
      this.gameState.ground.color = this.decoyColor;
      this.gameState.ground.drawGround();
    } else {
      // wrong!
      this.stacked = true;
      this.renderBlockTexture(this.decoyColor, this.decoyColor);

      // speed drop up
      this.body.velocity.y *= 3;
      this.body.bounce.y = 0.05;
      
    }
  }
}
Block.prototype.checkTap = function() {
  return this.color === this.gameState.ground.color;
};
