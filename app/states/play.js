
module.exports = GameState = function(game) {
};

// Load images and sounds
GameState.prototype.preload = function() {
    this.game.load.image('block', '/assets/block.png');

    this.game.scale.startFullScreen();
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; //resize your window to see the stage resize too
    // this.game.scale.forceOrientation(false, true, '/portrait-only.jpg');
    this.game.scale.refresh();
};

GameState.prototype.create = function() {
    
    this.game.stage.backgroundColor = '#aaa';

    this.GRAVITY = 300; // pixels/second/second
    this.game.physics.arcade.gravity.y = this.GRAVITY;

    this.BLOCKSIZE = 64;

    this.blockColors = ['red','orange','yellow','green','blue','purple'];

    this.blockPool = this.game.add.group();

    // start block pool with 100 pieces
    for(var i = 0; i < 100; i++) {
        this.addBlockToPool();
    }

    // lay ground
    var Ground = require('../entities/ground');
    this.ground = new Ground(this.game, GameState, this.game.height - 30);
    this.ground.name = 'ground';
    this.game.add.existing(this.ground);

    this.rainBlocks();

    // Show FPS
    this.game.time.advancedTiming = true;
    this.fpsText = this.game.add.text(
        20, 20, '', { font: '16px Arial', fill: '#ffffff' }
    );
};

GameState.prototype.rainBlocks = function() {
    var slots = this.game.width/this.BLOCKSIZE;
    var x = (this.game.rnd.integerInRange(0,slots)) * this.BLOCKSIZE;
    this.placeBlock(x, -this.BLOCKSIZE);
    this.game.time.events.add(1000, this.rainBlocks, this);
};

GameState.prototype.addBlockToPool = function(){
    var Block = require('../entities/block');
    var block = new Block(this.game, this, 0, 0);
    block.name = 'block'+this.blockPool.length;
    this.blockPool.add(block);
    return block;
};

GameState.prototype.placeBlock = function (x, y) {
    // Get a dead block from the pool
    var block = this.blockPool.getFirstDead();
    if (block === null) {
        console.log("increasing block pool to", this.blockPool.length);
        block = this.addBlockToPool();
    }
    block.init();
    block.revive();
    block.reset(x, y);

    return block;
};

blockCollide = function(block1, block2){

    if (block1.name === 'ground'){
      block2.hitGround();
    } else {
      block2.land();
    }
};

GameState.prototype.assignRandomeColor = function(){
  return this.rnd.pick(this.blockColors);
}

GameState.prototype.update = function() {
    if (this.game.time.fps !== 0) {
        this.fpsText.setText(this.game.time.fps + ' FPS');
    }
    this.game.physics.arcade.collide(this.blockPool, this.blockPool, blockCollide);
    this.game.physics.arcade.collide(this.blockPool, this.ground, blockCollide);

};


GameState.prototype.render = function render() {


    // this.blockPool.forEach(function(block){this.game.debug.body(block);},this);
};
