function LevelStart() {}

LevelStart.prototype = {
    preload: function() {

    },
    create: function() {
      // level #
      var style = { font: 'bold 40px Arial', fill: '#ffffff', align: 'center'};
      this.levelNumber = this.game.add.text(this.game.world.centerX, 100, 'Level '+this.game.currentLevel.level+'-'+this.game.currentLevel.subLevel, style);
      this.levelNumber.anchor.setTo(0.5, 0.5);

      // play
      this.play = this.game.add.text(this.game.width / 2, 300, 'PLAY NOW', { font: 'bold 36px Arial', fill: Phaser.Color.RGBtoWebstring(this.game.COLORS.orange), align: 'center'});
      this.play.anchor.setTo(0.5, 0.5);
      this.play.inputEnabled = true;
      this.play.events.onInputDown.add(function(){
        this.play.input.destroy();
        this.changeState('level');
      },this);

      // back
      this.back = this.game.add.text(this.game.width / 2, 375, 'Change level', { font: 'bold 20px Arial', fill: Phaser.Color.RGBtoWebstring(this.game.COLORS.white), align: 'center'});
      this.back.anchor.setTo(0.5, 0.5);
      this.back.inputEnabled = true;
      this.back.events.onInputDown.add(function(){
        this.back.input.destroy();
        this.changeState('levelSelect');
      },this);

      // beta notice
      this.betaNotice = this.game.add.text(this.game.world.centerX, this.game.world.height - 20, 'This is a beta version\nLeave feedback and get updates here', { font: '16px Arial', fill: 'red', align: 'center'});
      this.betaNotice.anchor.setTo(0.5, 0.5);
      this.betaNotice.inputEnabled = true;
      this.betaNotice.events.onInputDown.add(function(){window.location.href="http://codeperfectionist.com/portfolio/games/color-blindness-blitz/";});
    }
  };

LevelStart.prototype.changeState = function (state) {
  // clean things up
  this.levelNumber = null;
  this.play = null;
  this.betaNotice = null;

  // load state
  this.game.state.start(state);
};


module.exports = LevelStart;
