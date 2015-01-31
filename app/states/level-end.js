function LevelEnd() {}

LevelEnd.prototype = {
    preload: function() {

    },
    create: function() {
      // level #
      var style = { font: 'bold 40px Arial', fill: '#ffffff', align: 'center'};
      this.titleText = this.game.add.text(this.game.world.centerX, 100, 'Level '+this.game.pacing.level+'\nFinished', style);
      this.titleText.anchor.setTo(0.5, 0.5);

      // draw star outlines
      this.drawStars(3, true);

      // score
      this.scoreText = game.add.text(this.game.world.centerX, 300, 'Score: 0', { font: '36px Arial', fill: '#ffffff', align: 'left'});
      this.scoreText.anchor.setTo(0.5, 0.5);

      // next level
      this.restartText = game.add.text(this.game.world.centerX, 400, 'Tap to play again', { font: '16px Arial', fill: '#ffffff', align: 'left'});
      this.restartText.anchor.setTo(0.5, 0.5);

      // progress bar
      this.drawProgressBar({x: this.game.width * 0.1, y: 350});

      // beta notice
      this.betaNotice = game.add.text(this.game.world.centerX, this.game.world.height - 20, 'This is a beta version\nLeave feedback and get updates here', { font: '16px Arial', fill: 'red', align: 'center'});
      this.betaNotice.anchor.setTo(0.5, 0.5);
      this.betaNotice.inputEnabled = true;
      this.betaNotice.events.onInputDown.add(function(){window.location.href="http://codeperfectionist.com/portfolio/games/color-blindness-blitz/";});
    },
    update: function() {
      if(this.game.input.activePointer.justPressed()) {
        this.game.score.score = 0;
        this.game.state.start('level');
      }
    }
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

  var bestScore = game.add.graphics(position.x, position.y);
  // set a fill and line style
  bestScore.beginFill();
  bestScore.lineStyle(20, color, 0.5);
  // draw best possible score
  bestScore.moveTo(0, 0);
  bestScore.lineTo(this.game.width * 0.8, 0);
  bestScore.endFill();

  var playerScore = game.add.graphics(position.x, position.y);
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
  game.add.tween(playerScore.scale).to({x: 1}, 3500, Phaser.Easing.Quadratic.Out, true)
    .onUpdateCallback(function(){
        score = Math.round(this.game.score.levelScore * playerScore.scale.x);
        this.scoreText.text =  'Score: ' + score;
        if (score / this.game.score.maxLevelScore >= this.game.pacing.starBreakPoints[stars]) {
          this.drawStars(++stars);
        }
    }, this);
};

LevelEnd.prototype.drawStars = function (num, outline) {
  function drawStar (position, color, alpha) {
    var star = game.add.graphics(position.x, position.y);
    star.beginFill(color, alpha);
    star.drawCircle(0, 0, 30);
  }

  var starColors = [
    "blue",
    "green",
    "red"
  ];

  var alpha;
  if (outline) {
    alpha = 0.2;
  } else {
    alpha = 1;
  }
  for (var i = 0; i < num; i++) {
    drawStar({x: this.game.width * (i + 1) / 4, y: 220}, this.game.COLORS[starColors[i]], alpha);
  }
};

module.exports = LevelEnd;
