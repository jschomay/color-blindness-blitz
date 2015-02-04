function LevelSelect() {}

LevelSelect.prototype = {
    preload: function() {

    },
    create: function() {
      // level #
      var style = { font: 'bold 40px Arial', fill: '#ffffff', align: 'center'};
      this.levelNumber = this.game.add.text(this.game.world.centerX, 100, 'Level '+this.game.pacing.level, style);
      this.levelNumber.anchor.setTo(0.5, 0.5);

      // sublevels
      this.sublevels = this.game.add.group();
      var margin = this.game.width * 0.05;
      for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 3; j++) {
          var x = margin * 1 + j * this.game.width / 3 - j * margin / 2;
          var y = this.game.height / 2 + margin / 2 + i * this.game.height / 4 - i * margin / 2;
          var sublevel = this.game.add.graphics(x, y);
          sublevel.lineStyle(1, 0xFF0000);
          sublevel.drawRect(0, 0, this.game.width / 3 - margin, this.game.height / 4 - margin);
          this.sublevels.add(sublevel);
        }
      }


    }
  };

LevelSelect.prototype.playLevel = function () {
  // clean things up
  this.levelNumber = null;

  // load next state
  this.game.state.start('level-start');
};


module.exports = LevelSelect;
