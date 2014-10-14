  function LevelEnd() {}

  LevelEnd.prototype = {
    preload: function() {

    },
    create: function() {
      var style = { font: 'bold 45px Arial', fill: '#ffffff', align: 'center'};
      this.titleText = this.game.add.text(this.game.world.centerX, 100, 'Round Over', style);
      this.titleText.anchor.setTo(0.5, 0.5);

      this.scoreText = game.add.text(this.game.world.centerX, 200, 'Score: '+this.game.score.correct+' / '+this.game.score.total, { font: '16px Arial', fill: '#ffffff', align: 'left'});
      this.scoreText.anchor.setTo(0.5, 0.5);

      this.restartText = game.add.text(this.game.world.centerX, 300, 'Tap to play again', { font: '16px Arial', fill: '#ffffff', align: 'left'});
      this.restartText.anchor.setTo(0.5, 0.5);
    },
    update: function() {
      if(this.game.input.activePointer.justPressed()) {
        this.game.score.correct = 0;
        this.game.state.start('play');
      }
    }
  };

  module.exports = LevelEnd
