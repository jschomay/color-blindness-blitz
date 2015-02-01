  function Intro() {}

  Intro.prototype = {
    preload: function() {

    },
    create: function() {
      var style = { font: 'bold 45px Arial', fill: '#ffffff', align: 'center'};
      this.titleText = this.game.add.text(this.game.world.centerX, 100, 'Color\nBlindness\nBlitz', style);
      this.titleText.anchor.setTo(0.5, 0.5);

      this.instructionsText = game.add.text(this.game.world.centerX, 300, 'Rules:  Tap a word that matches the\ncolor of the lit up word.  If you get\nit right in time, the word will clear.\n\nTry to clear all the words.\n\nTap anywhere to start.', { font: '16px Arial', fill: '#ffffff', align: 'left'});
      this.instructionsText.anchor.setTo(0.5, 0.5);

      this.betaNotice = game.add.text(this.game.world.centerX, this.game.world.height - 20, 'This is a beta version\nLeave feedback and get updates here', { font: '16px Arial', fill: 'red', align: 'center'});
      this.betaNotice.anchor.setTo(0.5, 0.5);
      this.betaNotice.inputEnabled = true;
      this.betaNotice.events.onInputDown.add(function(){window.location.href="http://codeperfectionist.com/portfolio/games/color-blindness-blitz/";});
    },
    update: function() {
      if(this.game.input.activePointer.justPressed()) {
        this.game.state.start('levelStart');
      }
    }
  };

  module.exports = Intro
