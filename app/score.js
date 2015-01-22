module.exports = {
  levelScore: 0,
  currentStreak: 0,
  scoreMultiplier: 1,
  startLevel: function () {
    this.currentStreak = 0;
    this.scoreMultiplier = 1;
    this.levelScore = 0;
  },
  correct: function(wordScore, timeRemaining) {
    // dampen score value over time quadratically
    var points = wordScore * Phaser.Easing.Quadratic.Out(timeRemaining);

    // should we raise the multiplier?
    var nextMultiplier = 4; // raise multiplier every 4 consecutive corrects
    this.currentStreak++;
    if (this.scoreMultiplier < Math.floor(this.currentStreak / nextMultiplier) + 1) {
      this.scoreMultiplier++;
      console.log("X"+this.scoreMultiplier);
      // TODO show visual feedback of new multiplier
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
  }
};
