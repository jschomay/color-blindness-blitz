module.exports = {
  levelScore: 0,
  levelStars: 0,
  maxLevelScore: 0,
  currentStreak: 0,
  scoreMultiplier: 1,
  multiplierFrequency: 4,
  startLevel: function (game, wordsPool) {
    this.game = game;
    this.currentStreak = 0;
    this.scoreMultiplier = 1;
    this.levelScore = 0;
    this.levelStars = 0;
    this.maxLevelScore = this.calculateMaxLevelScore(wordsPool);
  },
  correct: function(wordScore, timeRemaining) {
    // dampen score value over time quadratically
    var points = wordScore * Phaser.Easing.Quadratic.Out(timeRemaining);

    // raise multiplier every Xth word (multiplierFrequency)
    this.currentStreak++;
    if (this.currentStreak % this.multiplierFrequency === 0) {
      this.scoreMultiplier++;
    }

    // round up to nearest 10 (and apply multiplier)
    points = this.scoreMultiplier * Math.ceil(points/10)*10;
    this.levelScore += points;

    return points;
  },
  wrong: function() {
    console.log("No points!  Streak ended!");
    this.scoreMultiplier = 1;
    this.currentStreak = 0;
  },
  calculateMaxLevelScore: function(wordsPool) {
    var maxLevelScore = 0;
    for (var i = 1; i <= wordsPool.length; i++) {
      maxLevelScore += 100 * (Math.floor(i / this.multiplierFrequency) + 1);
    }
    return maxLevelScore;
  }
};
