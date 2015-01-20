module.exports = {
  levelScore: 0,
  currentStreak: 0,
  startLevel: function () {
    this.currentStreak = 0;
    this.levelScore = 0;
  },
  correct: function() {
    var wordValue = 100; // TODO get from level manifest
    this.levelScore += wordValue;
  },
  wrong: function() {
  }
}
