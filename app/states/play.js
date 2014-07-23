BLOCKSIZE = 32;

module.exports = GameState = function(game) {
};

// Load images and sounds
GameState.prototype.preload = function() {
    this.game.load.image('block', '/assets/block.png');
};

GameState.prototype.create = function() {
    this.game.stage.backgroundColor = '#aaa';

    this.GRAVITY = 300; // pixels/second/second
    this.game.physics.arcade.gravity.y = this.GRAVITY;

    this.blockPool = this.game.add.group();

    // start block pool with 100 pieces
    for(var i = 0; i < 100; i++) {
        this.addBlockToPool();
    }

    // lay ground
    for(var x = 0; x < this.game.width; x += BLOCKSIZE) {
        var block = this.placeBlock(x, this.game.height - BLOCKSIZE);
        block.body.immovable = true;
        block.body.allowGravity = false;
    }

    this.rainBlocks();

    // Show FPS
    this.game.time.advancedTiming = true;
    this.fpsText = this.game.add.text(
        20, 20, '', { font: '16px Arial', fill: '#ffffff' }
    );
};

GameState.prototype.rainBlocks = function() {
    var slots = this.game.width/BLOCKSIZE;
    var x = (this.game.rnd.integerInRange(0,slots)) * BLOCKSIZE;
    this.placeBlock(x, -BLOCKSIZE);
    this.game.time.events.add(1000, this.rainBlocks, this);
};

GameState.prototype.addBlockToPool = function(){
    var Block = require('../entities/block');
    var block = new Block(this.game, 0, 0);
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
    block.revive();
    block.reset(x, y);

    return block;
};


// This function draws horizontal lines across the stage
// GameState.prototype.drawHeightMarkers = function() {
//     // Create a bitmap the same size as the stage
//     var bitmap = this.game.add.bitmapData(this.game.width, this.game.height);

//     // These functions use the canvas context to draw lines using the canvas API
//     for(y = this.game.height-BLOCKSIZE; y >= 64; y -= BLOCKSIZE) {
//         bitmap.context.beginPath();
//         bitmap.context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
//         bitmap.context.moveTo(0, y);
//         bitmap.context.lineTo(this.game.width, y);
//         bitmap.context.stroke();
//     }

//     this.game.add.image(0, 0, bitmap);
// };

// TODO move this into block.js
onCollide = function(block1, block2){
    // hacky way to let a block bounce once then stop
    // gets around bug(?) where stacked blocks bounce slightly
    // and fall through when stacks get to "heavy"
    if (block2.bounced) {
        block2.body.velocity.y = 0;
        block2.body.immovable = true;
        block2.body.allowGravity = false;
    } else {
        block2.bounced = true;
    }
};

GameState.prototype.update = function() {
    if (this.game.time.fps !== 0) {
        this.fpsText.setText(this.game.time.fps + ' FPS');
    }
    this.game.physics.arcade.collide(this.blockPool, this.blockPool, onCollide);

};


GameState.prototype.render = function render() {


    // this.blockPool.forEach(function(block){this.game.debug.body(block);},this);
};
