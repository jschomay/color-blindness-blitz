function LevelStart() {}

LevelStart.prototype = {
    preload: function() {

    },
    create: function() {
      // level #
      var style = { font: 'bold 40px Arial', fill: '#ffffff', align: 'center'};
      this.levelNumber = this.game.add.text(this.game.world.centerX, 100, 'Level '+this.game.pacing.level, style);
      this.levelNumber.anchor.setTo(0.5, 0.5);

      // play
      this.play = this.game.add.text(this.game.width / 2, 300, 'PLAY NOW', { font: 'bold 36px Arial', fill: Phaser.Color.RGBtoWebstring(this.game.COLORS.orange), align: 'center'});
      this.play.anchor.setTo(0.5, 0.5);
      this.play.inputEnabled = true;

      // beta notice
      this.betaNotice = this.game.add.text(this.game.world.centerX, this.game.world.height - 20, 'This is a beta version\nLeave feedback and get updates here', { font: '16px Arial', fill: 'red', align: 'center'});
      this.betaNotice.anchor.setTo(0.5, 0.5);
      this.betaNotice.inputEnabled = true;
      this.betaNotice.events.onInputDown.add(function(){window.location.href="http://codeperfectionist.com/portfolio/games/color-blindness-blitz/";});
    },
    update: function() {
      // play
      if(this.play.input.justPressed()) {
        this.play.input.destroy();
        this.playLevel();
      }
    }
  };

LevelStart.prototype.playLevel = function () {
  // clean things up
  this.levelNumber = null;
  this.play = null;
  this.betaNotice = null;

  // load next state
  this.game.state.start('level');
};


module.exports = LevelStart;
