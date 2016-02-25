function LevelEnd() {}

LevelEnd.prototype = {
    preload: function() {

    },
    create: function() {
      var currentLevel = this.game.currentLevel.level;
      var currentSubLevel = this.game.currentLevel.subLevel;
      var levelData = this.game.levelManager.getLevel(currentLevel)[currentSubLevel-1];
      var levelColorHex = this.game.COLORS[levelData.altLevelColor];

      this.previousScore = this.game.progress.getLevelProgress(this.game.currentLevel.level, this.game.currentLevel.subLevel);

      // save progress
      this.game.score.levelStars = this.game.score.getStarsFromScore();
      this.game.progress.saveLevelProgress(this.game.currentLevel.level, this.game.currentLevel.subLevel, {
        score: this.game.score.levelScore,
        stars: this.game.score.levelStars
      });

      // level #
      var style = { font: 'bold 40px Arial', fill: Phaser.Color.RGBtoWebstring(levelColorHex), align: 'center'};
      this.titleText = this.game.add.text(this.game.world.centerX, 80, levelData.levelColor + ' #' +this.game.currentLevel.subLevel+'\nFinished', style);
      this.titleText.anchor.setTo(0.5, 0.5);

      // draw star outlines
      var emptyStarsGraphic = this.game.drawStars.drawEmptyStars(this.game.width);
      emptyStarsGraphic.y = 180;

      // high score
      var style = { font: 'bold 16px arial', fill: Phaser.Color.RGBtoWebstring(this.game.COLORS['white']), align: 'center'};
      var highScoreText;
      if(this.game.score.levelScore > this.previousScore.score) {
        highScoreText = "New high score!";
      } else {
        highScoreText = "Best score: " + this.previousScore.score;
      }
      this.highScoreTextSprite = this.game.add.text(this.game.world.centerX, 280, highScoreText, style);
      this.highScoreTextSprite.anchor.setTo(0.5, 0.5);

      // score
      this.scoreText = this.game.add.text(this.game.world.centerX, 250, 'Score: 0', { font: '38px Arial', fill: Phaser.Color.RGBtoWebstring(this.game.COLORS['white']), align: 'left'});
      this.scoreText.anchor.setTo(0.5, 0.5);

      // try again
      this.tryAgain = this.game.add.text(this.game.width / 4, 380, 'TRY\nAGAIN', { font: '26px Arial', fill: '#ffffff', align: 'center'});
      this.tryAgain.anchor.setTo(0.5, 0.5);
      this.tryAgain.inputEnabled = true;
      this.tryAgain.events.onInputDown.add(function(){
        this.tryAgain.input.destroy();
        this.startLevel();
      }, this);

      // next level
      this.nextLevel = this.game.add.text(this.game.width * 3 / 4, 380, 'NEXT\nLEVEL', { font: '26px Arial', fill: '#ffffff', align: 'center'});
      this.nextLevel.anchor.setTo(0.5, 0.5);
      this.nextLevel.inputEnabled = true;
      this.nextLevel.alpha = 0.2;
      this.nextLevel.events.onInputDown.add(function(){
        if(this.game.score.levelStars >= 1) {
          if(this.game.levelManager.isGameWin()) {
            this.cleanUp();
            this.game.state.start('gameWin');
            return
          }
          this.nextLevel.input.destroy();
          this.game.levelManager.nextLevel();
          this.startLevel();
        }
      }, this);

      // progress bar
      this.drawProgressBar({x: this.game.width * 0.1, y: 310});
    }
  };

LevelEnd.prototype.cleanUp = function () {
  // clean things up
  this.progressTween.stop();
  this.highScoreTextSprite = null;
  this.progressTween = null;
  this.titleText = null;
  this.scoreText = null;
  this.tryAgain = null;
  this.nextLevel = null;
};

LevelEnd.prototype.startLevel = function () {
  this.cleanUp();
  // load next state
  this.game.state.start('levelStart');
};

LevelEnd.prototype.drawProgressBar = function(position){
  console.log("you scored", this.game.score.levelScore, 'out of', this.game.score.maxLevelScore);

  var percentage;
  if(this.game.score.levelScore > this.game.score.maxLevelScore) {
    // could happen with bonuses
    percentage = 1;
  } else {
    percentage = this.game.score.levelScore / this.game.score.maxLevelScore;
  }

  var color = 0xffd900;

  var bestScore = this.game.add.graphics(position.x, position.y);
  // set a fill and line style
  bestScore.beginFill();
  bestScore.lineStyle(20, color, 0.5);
  // draw best possible score
  bestScore.moveTo(0, 0);
  bestScore.lineTo(this.game.width * 0.8, 0);
  bestScore.endFill();

  var playerScore = this.game.add.graphics(position.x, position.y);
  // set a fill and line style
  playerScore.beginFill();
  playerScore.lineStyle(20, color, 1);
  // draw player's score
  playerScore.moveTo(0, 0);
  playerScore.lineTo(percentage * this.game.width * 0.8, 0);
  playerScore.endFill();


  playerScore.scale.x = 0;
  var score = 0;
  var stars = 0;
  var starsGraphic;
  this.progressTween = this.game.add.tween(playerScore.scale);
  this.progressTween.to({x: 1}, 3500, Phaser.Easing.Quadratic.Out, true);
  this.progressTween.onUpdateCallback(function(){
        score = Math.round(this.game.score.levelScore * playerScore.scale.x);
        this.scoreText.text =  'Score: ' + score;
        if (score / this.game.score.maxLevelScore >= this.game.currentLevel.starBreakPoints[stars]) {
          starsGraphic = null
          starsGraphic = this.game.drawStars.fillStars(this.game.width, ++stars);
          starsGraphic.y = 180;
          if (stars >= 1) {
            this.nextLevel.alpha = 1;
          }
        }
    }, this);
};

module.exports = LevelEnd;
