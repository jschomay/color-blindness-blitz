function LevelSelect() {}

LevelSelect.prototype = {
    preload: function() {

    },
    create: function() {
      // make levels
      this.levels = this.game.add.group();
      for (var l = 1; l <= this.game.levelManager.numLevels; l++) {
        levelData = this.game.levelManager.getLevel(l)[0];
        this.levels.addChild(this.makeLevel(l - 1, levelData));
      }
      // jump to current level screen
      this.levels.x = this.levels.x - this.game.width * (this.game.levelManager.currentLevel - 1);
    }
};

LevelSelect.prototype.makeLevel = function (levelIndex, levelData) {
  var levelGroup = this.game.add.group();
  levelGroup.x = this.game.width * levelIndex;

  levelGroup.levelColor = levelData.levelColor;
  levelGroup.levelColorHex = this.game.COLORS[levelData.altLevelColor];
  levelGroup.level = levelData.level;
  levelGroup.levelName = levelData.levelName;

  // cheat
  var cheat = this.game.add.sprite(0,0);
  cheat.width = 20;
  cheat.heigth = 20;
  cheat.inputEnabled = true;
  cheat.events.onInputDown.add(function(){
    (require("../lib/cheat"))();
  },this);

  // title
  var style = { font: 'bold 40px Arial', fill: Phaser.Color.RGBtoWebstring(levelGroup.levelColorHex), align: 'center'};
  var levelNumber = this.game.add.text(this.game.world.centerX, this.game.height / 10, levelGroup.levelColor + ' Level', style);
  levelNumber.anchor.setTo(0.5, 0.5);
  levelGroup.addChild(levelNumber)

  // sub heading
  style = { font: '24px Arial', fill: Phaser.Color.RGBtoWebstring(levelGroup.levelColorHex), align: 'center'};
  var status = this.game.progress.getLevelStatus(levelGroup.level, 1);
  var levelTitleText;
  if(status === this.game.progress.LOCKED) {
    levelTitleText = "????";
  } else {
    levelTitleText = '"'+levelGroup.levelName+'"';
  }
  var subHeading = this.game.add.text(this.game.world.centerX, this.game.height / 5, levelTitleText, style);
  subHeading.anchor.setTo(0.5, 0.5);
  levelGroup.addChild(subHeading);

  // choose a level
  style = { font: 'bold 20px Arial', fill: Phaser.Color.RGBtoWebstring(levelGroup.levelColorHex), align: 'center'};
  var chooseText = this.game.add.text(this.game.world.centerX, this.game.height / 2 - this.game.height / 30, "Choose a sublevel:", style);
  chooseText.anchor.setTo(0.5, 0.5);
  levelGroup.addChild(chooseText);

  // arrows
  if (this.game.levelManager.isNextLevel(levelIndex + 1)) {
    var rightArrow = this.addArrow(levelGroup, "right");
    levelGroup.addChild(rightArrow);
  }
  if (this.game.levelManager.isPreviousLevel(levelIndex + 1)) {
    var leftArrow = this.addArrow(levelGroup, "left");
    levelGroup.addChild(leftArrow);
  }

  // subLevels
  var subLevels = this.game.add.group();
  levelGroup.addChild(subLevels);
  var subLevelNumber = 1;
  var margin = this.game.width * 0.05;
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 3; j++) {
      var x = margin * 1 + j * this.game.width / 3 - j * margin / 2;
      var y = this.game.height / 2 + margin / 2 + i * this.game.height / 4 - i * margin / 2;
      var width = this.game.width / 3 - margin;
      var height =this.game.height / 4 - margin;
      subLevels.add(this.makeSubLevel(levelGroup, x, y, width, height, subLevelNumber++));
    }
  }

  return levelGroup;
};


LevelSelect.prototype.makeSubLevel = function (level, x, y, width, height, subLevelNumber) {
  var subLevelBox = this.game.add.sprite(x,y);

  // border
  var graphics = this.game.add.graphics(0, 0);
  graphics.lineStyle(1, level.levelColorHex);
  graphics.drawRect(0, 0, width, height);
  subLevelBox.addChild(graphics);
  subLevelBox.crop({x: x, y: y, width: width, height: height});

  // title
  var style = { font: 'bold 20px Arial', fill: Phaser.Color.RGBtoWebstring(level.levelColorHex), align: 'center'};
  var title = this.game.add.text(width / 2, height / 20, subLevelNumber, style);
  title.anchor = {x: 0.5, y: 0};
  subLevelBox.addChild(title);

  // check progress
  var status = this.game.progress.getLevelStatus(level.level, subLevelNumber);
  var levelProgress = this.game.progress.getLevelProgress(level.level, subLevelNumber);
  if(status === this.game.progress.READY || status === this.game.progress.COMPLETE) {
    // stars
    var stars = this.game.drawStars.drawStars(subLevelBox.width, levelProgress.stars);
    stars.y = subLevelBox.height / 2;
    subLevelBox.addChild(stars);
    // play text
    var style = { font: '16px Arial', fill: Phaser.Color.RGBtoWebstring(this.game.COLORS['white']), align: 'center'};
    var playText = this.game.add.text(width / 2, height * 3 / 4, "Play", style);
    playText.anchor = {x: 0.5, y: 0};
    subLevelBox.addChild(playText);
  } else {
    // locked
    var style = { font: '20px Arial', fill: Phaser.Color.RGBtoWebstring(0x444444), align: 'center'};
    var lockedText = this.game.add.text(width / 2, height / 2, "Locked", style);
    lockedText.anchor = {x: 0.5, y: 0};
    subLevelBox.addChild(lockedText);
  }

  // on select
  if(status !== this.game.progress.LOCKED) {
    subLevelBox.inputEnabled = true;
    subLevelBox.events.onInputDown.add(function(){
      this.game.sfx.menuClick.play();
      subLevelBox.input.destroy();
      this.selectLevel(level.level, subLevelNumber);
    },this);
  }

  return subLevelBox;
};

LevelSelect.prototype.addArrow = function (level, direction) {
  var x = direction === "right" ? this.game.width - this.game.width / 10 : this.game.width / 20;
  var y = this.game.width / 2;
  var arrow = this.game.add.graphics(0, 0);
  arrow.beginFill(level.levelColorHex);
  arrow.moveTo(0,0);
  arrow.lineTo(this.game.width / 20, this.game.width / 20);
  arrow.lineTo(0, 2 * this.game.width / 20);
  arrow.lineTo(0, 0);
  if (direction !== "right") {
    arrow.scale.x *= -1;
    arrow.x = x;
  }
  var arrowSprite = this.game.add.sprite(x, y);
  arrowSprite.addChild(arrow);

  // handler
  if (direction !== "right") {
    arrowSprite.handler = this.previousLevel;
  } else {
    arrowSprite.handler = this.nextLevel;
  }

  // on select
  arrowSprite.inputEnabled = true;
  arrowSprite.events.onInputDown.add(arrowSprite.handler, this);

  return arrowSprite;
};

LevelSelect.prototype.nextLevel = function () {
  this.game.sfx.correct.play();
  this.game.add.tween(this.levels).to({x: this.levels.x - this.game.width}, 300, Phaser.Easing.Quadratic.InOut, true);
};

LevelSelect.prototype.previousLevel = function () {
  this.game.sfx.correct.play();
  this.game.add.tween(this.levels).to({x: this.levels.x + this.game.width}, 300, Phaser.Easing.Quadratic.InOut, true);
};

LevelSelect.prototype.selectLevel = function (level, subLevel) {
  // clean things up
  this.levels.destroy();

  // select level
  this.game.levelManager.setLevel(level, subLevel);

  // load next state
  this.game.state.start('levelStart');
};


module.exports = LevelSelect;
