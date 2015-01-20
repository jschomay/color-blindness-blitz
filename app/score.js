module.exports = {
  levelScore: 0,
  currentStreak: 0,
  startLevel: function () {
    this.currentStreak = 0;
    this.levelScore = 0;
  },
  correct: function(points) {
    // round up to nearest 10
    points = Math.ceil(points/10)*10;
    this.levelScore += points;
    console.log(points+' points! Total score: '+this.levelScore)
  },
  wrong: function() {
  }
}
