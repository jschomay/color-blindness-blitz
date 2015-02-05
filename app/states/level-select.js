function LevelSelect() {}

LevelSelect.prototype = {
    preload: function() {

    },
    create: function() {
      this.levelColor = this.game.COLORS.red;
      // level #
      var style = { font: 'bold 40px Arial', fill: Phaser.Color.RGBtoWebstring(this.levelColor), align: 'center'};
      this.levelNumber = this.game.add.text(this.game.world.centerX, 100, 'Level '+this.game.pacing.level, style);
      this.levelNumber.anchor.setTo(0.5, 0.5);

      // sublevels
      this.sublevels = this.game.add.group();
      var margin = this.game.width * 0.05;
      for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 3; j++) {
          var x = margin * 1 + j * this.game.width / 3 - j * margin / 2;
          var y = this.game.height / 2 + margin / 2 + i * this.game.height / 4 - i * margin / 2;
          var width = this.game.width / 3 - margin;
          var height =this.game.height / 4 - margin;
          this.sublevels.add(this.makeSublevel(x, y, width, height, this.game.pacing.level + "-" + (i + 1) * (j + 1)));
        }
      }


    }
  };


LevelSelect.prototype.makeSublevel = function (x, y, width, height, num) {
  var sublevel = this.game.add.graphics(x, y);
  sublevel.lineStyle(1, this.levelColor);
  sublevel.drawRect(0, 0, width, height);
  var style = { font: 'bold 20px Arial', fill: Phaser.Color.RGBtoWebstring(this.levelColor), align: 'center'};
  sublevel.title = this.game.add.text(x + width / 2, y + height / 20, num, style);
  sublevel.title.anchor = {x: 0.5, y: 0};
  return sublevel;
};

LevelSelect.prototype.selectLevel = function () {
  // clean things up
  this.levelNumber = null;

  // load next state
  this.game.state.start('level-start');
};


module.exports = LevelSelect;
