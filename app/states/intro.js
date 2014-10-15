  function Intro() {}

  Intro.prototype = {
    preload: function() {

    },
    create: function() {
      var style = { font: 'bold 45px Arial', fill: '#ffffff', align: 'center'};
      this.titleText = this.game.add.text(this.game.world.centerX, 100, 'Color\nBlindness\nBlitz', style);
      this.titleText.anchor.setTo(0.5, 0.5);

      this.instructionsText = game.add.text(this.game.world.centerX, 300, 'Rules:  When a word lights up, tap any\nword that says the name of the color of\nthe lit up word.  If you get it right in time,\nthe word will clear.  If you miss, it will \n"freeze" onto the screen.  Try to clear all\nthe words.\n\nTap anywhere to start.', { font: '16px Arial', fill: '#ffffff', align: 'left'});
      this.instructionsText.anchor.setTo(0.5, 0.5);
    },
    update: function() {
      if(this.game.input.activePointer.justPressed()) {
        this.game.state.start('level');
      }
    }
  };

  module.exports = Intro
