function LevelStart() {}

LevelStart.prototype = {
    preload: function() {

    },
    create: function() {
      var currentLevel = this.game.currentLevel.level;
      var currentSubLevel = this.game.currentLevel.subLevel;
      var levelData = this.game.levelManager.getLevel(currentLevel)[currentSubLevel-1];
      var levelColorHex = this.game.COLORS[levelData.altLevelColor];

      // level #
      var style = { font: 'bold 40px Arial', fill: Phaser.Color.RGBtoWebstring(levelColorHex), align: 'center'};
      this.levelNumber = this.game.add.text(this.game.world.centerX, this.game.height / 5, levelData.levelColor + ' #' + this.game.currentLevel.subLevel, style);
      this.levelNumber.anchor.setTo(0.5, 0.5);

      // play
      this.play = this.game.add.text(this.game.width / 2, this.game.height / 2, 'PLAY NOW', { font: 'bold 36px Arial', fill: Phaser.Color.RGBtoWebstring(this.game.COLORS['white']), align: 'center'});
      this.play.anchor.setTo(0.5, 0.5);
      this.play.inputEnabled = true;
      this.play.events.onInputDown.add(function(){
        this.game.sfx.menuClick.play();
        this.game.titleMusic.stop();
        this.play.input.destroy();
        this.changeState('level');
      },this);

      // back
      this.back = this.game.add.text(this.game.width / 2, this.game.height * 4 / 5, 'Change level', { font: 'bold 20px Arial', fill: Phaser.Color.RGBtoWebstring(levelColorHex), align: 'center'});
      this.back.anchor.setTo(0.5, 0.5);
      this.back.inputEnabled = true;
      this.back.events.onInputDown.add(function(){
        this.game.sfx.menuClick.play();
        this.back.input.destroy();
        this.changeState('levelSelect');
      },this);
    }
  };

LevelStart.prototype.changeState = function (state) {
  // clean things up
  this.levelNumber = null;
  this.play = null;

  // load state
  this.game.state.start(state);
};


module.exports = LevelStart;
