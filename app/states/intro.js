  function Intro() {}

  Intro.prototype = {
    preload: function() {
      // set scaling for game
      this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.game.scale.refresh();
    },
    create: function() {
      var style = { font: 'bold 55px Arial', fill: '#ffffff', align: 'center'};
      style.fill = Phaser.Color.RGBtoWebstring(this.game.COLORS.red);
      this.titleText1 = this.game.add.text(this.game.world.centerX, 80, 'Color', style);
      style.fill = Phaser.Color.RGBtoWebstring(this.game.COLORS.blue);
      this.titleText2 = this.game.add.text(this.game.world.centerX, 130, 'Blindness', style);
      style.fill = Phaser.Color.RGBtoWebstring(this.game.COLORS.green);
      this.titleText3 = this.game.add.text(this.game.world.centerX, 190, 'Blitz', style);
      this.titleText1.anchor.setTo(0.5, 0.5);
      this.titleText2.anchor.setTo(0.5, 0.5);
      this.titleText3.anchor.setTo(0.5, 0.5);

      this.instructionsText = this.game.add.text(this.game.world.centerX, this.game.height - 100, 'You must clear all the words from the screen.\n\nWhen a word lights up, tap a word matching the lit up word\'s color, not the color it spells.\n\nTap to begin...', { font: '16px Arial', fill: '#ffffff', align: 'left', wordWrap: true, wordWrapWidth: this.game.width * 0.8});
      this.instructionsText.anchor.setTo(0.5, 1);
    },
    update: function() {
      if(this.game.input.activePointer.justPressed()) {
        this.game.state.start('levelSelect');
      }
    }
  };

  module.exports = Intro
