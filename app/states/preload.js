module.exports =  Preload = function() {
};

Preload.prototype = {
  preload: function () {
    // load resources here
    this.game.load.audio('titleMusic', 'audio/Menu_Loop.ogg');
    this.game.load.audio('levelMusic', 'audio/MainGame_Loop.ogg');
    this.game.load.audio('levelMusicShort', 'audio/MainGameShort_Loop.ogg');
    this.game.load.audio('correct', 'audio/correct.ogg');
    this.game.load.audio('tooslow', 'audio/tooslow.ogg');
    this.game.load.audio('finish', 'audio/Finish.ogg');
    this.game.load.audio('incorrect', 'audio/incorrect.ogg');
    this.game.load.audio('incorrect2', 'audio/incorrect2.ogg');
    this.game.load.audio('menuclick', 'audio/menuclick.ogg');

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

    this.game.sfx.correct = this.game.add.audio('correct');
    this.game.sfx.tooslow = this.game.add.audio('tooslow');
    this.game.sfx.finish = this.game.add.audio('finish');
    this.game.sfx.incorrect = this.game.add.audio('incorrect');
    this.game.sfx.incorrect2 = this.game.add.audio('incorrect2');
    this.game.sfx.menuClick = this.game.add.audio('menuclick');

    this.game.titleMusic = this.game.add.audio('titleMusic');
    this.game.titleMusic.addMarker('fromStart', 0, 0, 1, false)

    this.game.levelMusic = this.game.add.audio('levelMusic');
    this.game.levelMusic = this.game.add.audio('levelMusic');
    this.game.levelMusic.addMarker('fromStart', 0, 0, 1, false)
    this.game.levelMusic.addMarker('fromLoop', 19.592, 78.367 - 19.592, 1, false)
    this.game.levelMusic.onMarkerComplete.addOnce(function(markerName){
      if(markerName === 'fromStart') {
        var self = this;
        // this is needed because onMarkerComplete gets called before stop, which clears currentMarker
        window.setTimeout(function(){self.game.levelMusic.currentMarker = 'fromLoop'}, 0);
        this.game.levelMusic.play('fromLoop', 0, 1, true);
      }
    }, this)

    this.game.levelMusicShort = this.game.add.audio('levelMusicShort');
    this.game.levelMusicShort.addMarker('fromStart', 0, 0, 1, false)
    this.game.levelMusicShort.addMarker('fromLoop', 19.592, 39.184 - 19.592, 1, false)
    this.game.levelMusicShort.onMarkerComplete.add(function(markerName){
      if(markerName === 'fromStart') {
        var self = this;
        // this is needed because onMarkerComplete gets called before stop, which clears currentMarker
        window.setTimeout(function(){self.game.levelMusicShort.currentMarker = 'fromLoop'}, 0);
        this.game.levelMusicShort.play('fromLoop', 0, 1, true);
      }
    }, this)

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
