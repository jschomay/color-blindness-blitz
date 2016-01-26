  function GameWin() {}

  GameWin.prototype = {
    preload: function() {
    },
    create: function() {
      var style = { font: 'bold 55px Arial', fill: '#ffffff', align: 'center'};
      style.fill = Phaser.Color.RGBtoWebstring(this.game.COLORS.green);
      this.titleText = this.game.add.text(this.game.world.centerX, 190, 'You win!', style);
      this.titleText.anchor.setTo(0.5, 0.5);

      this.winNotes = this.game.add.text(this.game.world.centerX, this.game.height - 100, 'Thank you for playing!  That\'s it for now.  If you had a good time, share this game with your friends.', { font: '16px Arial', fill: '#ffffff', align: 'left', wordWrap: true, wordWrapWidth: this.game.width * 0.8});
      this.winNotes.anchor.setTo(0.5, 1);
    },
    update: function() {
      if(this.game.input.activePointer.justPressed()) {
        this.game.state.start('levelSelect');
      }
    }
  };

  module.exports = GameWin
