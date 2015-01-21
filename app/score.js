module.exports = {
  levelScore: 0,
  currentStreak: 0,
  startLevel: function () {
    this.currentStreak = 0;
    this.levelScore = 0;
  },
  correct: function(wordScore, timeRemaining) {
    // dampen score value over time quadratically
    var points = wordScore * Phaser.Easing.Quadratic.Out(timeRemaining);
    // round up to nearest 10
    points = Math.ceil(points/10)*10;
    this.levelScore += points;

    return points;
  },
  wrong: function() {
    console.log("No points!  Streak ended!");
  }
};
