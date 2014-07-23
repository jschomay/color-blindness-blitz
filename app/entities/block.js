module.exports = Block = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'Block');

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

// Block movements
Block.prototype.update = function() {

};
