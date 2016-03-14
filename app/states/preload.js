module.exports =  Preload = function() {
};

Preload.prototype = {
  preload: function () {
    // load resources here
    this.game.load.audio('titleMusic', 'audio/Menu_Loop.ogg');
    this.game.load.audio('levelMusic', 'audio/MainGame_Loop.ogg');
    this.game.load.audio('correct', 'audio/correct.ogg');
    this.game.load.audio('tooslow', 'audio/tooslow.ogg');
    this.game.load.audio('finish', 'audio/Finish.ogg');
    this.game.load.audio('incorrect', 'audio/incorrect.ogg');

    // preload bar
    var bmd = this.game.add.bitmapData(this.game.width * 0.8, 10);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0,0,this.game.width * 0.8 ,10);
    bmd.ctx.fillStyle = 'yellow';
    bmd.ctx.fill();
    
    this.progressBar = this.game.add.sprite((this.game.width * 0.1), (this.game.height) / 2.0, bmd);

    this.load.setPreloadSprite(this.progressBar);

    this.loadingText = this.game.add.text(this.game.width / 2 - 40, this.game.height * 1 / 3, 'Loading...', { font: 'bold 20px Arial', fill: '#ffffff', align: 'center'});
  },

  create: function () {
    this.progressBar.cropEnabled = false;

    this.game.titleMusic = this.game.add.audio('titleMusic');
    this.game.sfx.correct = this.game.add.audio('correct');
    this.game.sfx.tooslow = this.game.add.audio('tooslow');
    this.game.sfx.finish = this.game.add.audio('finish');
    this.game.sfx.incorrect = this.game.add.audio('incorrect');
    console.log(this.game.titleMusic)

    this.loadingText.x -= 40;
  },

  render: function () {
    // this.game.debug.soundInfo(this.game.titleMusic, 20, 32);
  },

  update: function () {
    if (this.cache.isSoundDecoded('titleMusic') && this.cache.isSoundDecoded('levelMusic')) {
      this.state.start('intro');
    } else {
      this.loadingText.text = 'Preparing assets...';
    }
  }
}
