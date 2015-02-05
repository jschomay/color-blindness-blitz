function LevelSelect() {}

LevelSelect.prototype = {
    preload: function() {

    },
    create: function() {
      this.levelColor = this.game.COLORS.red;
      this.level = 1;

      // title
      var style = { font: 'bold 40px Arial', fill: Phaser.Color.RGBtoWebstring(this.levelColor), align: 'center'};
      this.levelNumber = this.game.add.text(this.game.world.centerX, this.game.height / 10, 'Level '+this.game.pacing.level, style);
      this.levelNumber.anchor.setTo(0.5, 0.5);

      // sub heading
      style = { font: '24px Arial', fill: Phaser.Color.RGBtoWebstring(this.levelColor), align: 'center'};
      this.subHeading = this.game.add.text(this.game.world.centerX, this.game.height / 5, '"Color theory"', style);
      this.subHeading.anchor.setTo(0.5, 0.5);

      // choose a level
      style = { font: 'bold 20px Arial', fill: Phaser.Color.RGBtoWebstring(this.levelColor), align: 'center'};
      this.chooseText = this.game.add.text(this.game.world.centerX, this.game.height / 2 - this.game.height / 30, "Choose a level:", style);
      this.chooseText.anchor.setTo(0.5, 0.5);

      // sublevels
      this.sublevels = this.game.add.group();
      var margin = this.game.width * 0.05;
      for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 3; j++) {
          var x = margin * 1 + j * this.game.width / 3 - j * margin / 2;
          var y = this.game.height / 2 + margin / 2 + i * this.game.height / 4 - i * margin / 2;
          var width = this.game.width / 3 - margin;
          var height =this.game.height / 4 - margin;
          this.sublevels.add(this.makeSublevel(x, y, width, height, this.level + "-" + (i + 1) * (j + 1)));
        }
      }


    }
  };


LevelSelect.prototype.makeSublevel = function (x, y, width, height, level) {
  var sublevel = this.game.add.sprite(x,y);

  // border
  var graphics = this.game.add.graphics(0, 0);
  graphics.lineStyle(1, this.levelColor);
  graphics.drawRect(0, 0, width, height);
  sublevel.addChild(graphics);
  sublevel.crop({x: x, y: y, width: width, height: height});

  // title
  var style = { font: 'bold 20px Arial', fill: Phaser.Color.RGBtoWebstring(this.levelColor), align: 'center'};
   var title = this.game.add.text(width / 2, height / 20, level, style);
  title.anchor = {x: 0.5, y: 0};
  sublevel.addChild(title);

  // on select
  sublevel.inputEnabled = true;
  sublevel.events.onInputDown.add(function(){
    sublevel.input.destroy();
    this.selectLevel(level);
  },this);

  return sublevel;
};

LevelSelect.prototype.selectLevel = function (level) {
  // clean things up
  this.levelNumber = null;
  this.sublevels.destroy();

  // select level
  this.game.pacing.level = level;

  // load next state
  this.game.state.start('levelStart');
};


module.exports = LevelSelect;
