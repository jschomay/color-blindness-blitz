module.exports = GameState = function(game) {
};

// Load images and sounds
GameState.prototype.preload = function() {
    this.game.scale.startFullScreen();
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; //resize your window to see the stage resize too
    // this.game.scale.forceOrientation(false, true, '/portrait-only.jpg');
    this.game.scale.refresh();
};

// Set up the game and kick it off
GameState.prototype.create = function() {
    this.game.stage.backgroundColor = '#000';

    // constants
    this.COLORS = ['red','orange','green','blue','purple'];

    this.wordsPool = this.game.add.group();
    // start words pool with 50 objects
    for(var i = 0; i < 100; i++) {
        this.addWordToPool();
    }
    
    // this.game.time.events.add(300, this.hightlighRandomWord, this);

    // Show FPS
    // this.game.time.advancedTiming = true;
    // this.fpsText = this.game.add.text(
    //     20, 20, '', { font: '16px Arial', fill: '#ffffff' }
    // );

    this.buildWordGrid();
};

GameState.prototype.addWordToPool = function() {
    var Word = require('../entities/word');
    var word = new Word(this.game, this, 0, 0);
    word.name = 'word'+this.wordsPool.length;
    this.wordsPool.add(word);
    return word;
};

GameState.prototype.placeWord = function(x, y) {
    // Get a dead word from the pool
    var word = this.wordsPool.getFirstDead();
    if (word === null) {
        console.log("increasing word pool to", this.wordsPool.length);
        word = this.addWordToPool();
    }
    word.init();
    word.revive();
    word.reset(x, y);

    return word;
};

GameState.prototype.assignRandomColor = function(){
  return this.rnd.pick(this.COLORS);
}

GameState.prototype.buildWordGrid = function() {
};

GameState.prototype.checkIsGameOver = function(word) {
  return false;
};

GameState.prototype.doGameOver = function() {
};

GameState.prototype.update = function() {
    if (this.game.time.fps !== 0) {
        this.fpsText.setText(this.game.time.fps + ' FPS');
    }
};

GameState.prototype.render = function render() {
    // this.wordsPool.forEach(function(word){this.game.debug.body(word);},this);
};
