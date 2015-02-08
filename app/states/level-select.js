function LevelSelect() {}

LevelSelect.prototype = {
    preload: function() {

    },
    create: function() {
      this.levelColor = this.game.currentLevel.levelColor;
      this.levelColorHex = this.game.COLORS[this.levelColor];
      this.level = this.game.currentLevel.level;
      this.levelName = this.game.currentLevel.levelName;

      // title
      var style = { font: 'bold 40px Arial', fill: Phaser.Color.RGBtoWebstring(0xFFFFFF), align: 'center'};
      this.levelNumber = this.game.add.text(this.game.world.centerX, this.game.height / 10, 'Level '+this.level, style);
      this.levelNumber.anchor.setTo(0.5, 0.5);

      // sub heading
      style = { font: '24px Arial', fill: Phaser.Color.RGBtoWebstring(this.levelColorHex), align: 'center'};
      this.subHeading = this.game.add.text(this.game.world.centerX, this.game.height / 5, '"'+this.levelName+'"', style);
      this.subHeading.anchor.setTo(0.5, 0.5);

      // choose a level
      style = { font: 'bold 20px Arial', fill: Phaser.Color.RGBtoWebstring(0xFFFFFF), align: 'center'};
      this.chooseText = this.game.add.text(this.game.world.centerX, this.game.height / 2 - this.game.height / 30, "Choose a level:", style);
      this.chooseText.anchor.setTo(0.5, 0.5);

      // subLevels
      this.subLevels = this.game.add.group();
      var subLevelNumber = 1;
      var margin = this.game.width * 0.05;
      for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 3; j++) {
          var x = margin * 1 + j * this.game.width / 3 - j * margin / 2;
          var y = this.game.height / 2 + margin / 2 + i * this.game.height / 4 - i * margin / 2;
          var width = this.game.width / 3 - margin;
          var height =this.game.height / 4 - margin;
          this.subLevels.add(this.makesubLevel(x, y, width, height, subLevelNumber++));
        }
      }


    }
  };


LevelSelect.prototype.makesubLevel = function (x, y, width, height, subLevelNumber) {
  var subLevelBox = this.game.add.sprite(x,y);

  // border
  var graphics = this.game.add.graphics(0, 0);
  graphics.lineStyle(1, this.levelColorHex);
  graphics.drawRect(0, 0, width, height);
  subLevelBox.addChild(graphics);
  subLevelBox.crop({x: x, y: y, width: width, height: height});

  // title
  var style = { font: 'bold 20px Arial', fill: Phaser.Color.RGBtoWebstring(0xFFFFFF), align: 'center'};
  var title = this.game.add.text(width / 2, height / 20, this.level+'-'+subLevelNumber, style);
  title.anchor = {x: 0.5, y: 0};
  subLevelBox.addChild(title);

  // on select
  subLevelBox.inputEnabled = true;
  subLevelBox.events.onInputDown.add(function(){
    subLevelBox.input.destroy();
    this.selectLevel(this.level, subLevelNumber);
 },this);

  return subLevelBox;
};

LevelSelect.prototype.selectLevel = function (level, subLevel) {
  // clean things up
  this.levelNumber = null;
  this.subLevels.destroy();
  this.subHeading.destroy();

  // select level
  this.game.levelManager.setLevel(level, subLevel);

  // load next state
  this.game.state.start('levelStart');
};


module.exports = LevelSelect;
