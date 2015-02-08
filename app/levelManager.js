module.exports = function (game) {
  return {
    currentLevel: 1,
    currentSubLevel: 1,
    levels: require("./levels"),
    setLevel: function(level, subLevel) {
      this.currentLevel = level;
      this.currentSubLevel = subLevel;
      game.currentLevel = this.levels[this.currentLevel - 1][this.currentSubLevel - 1];
    },
    nextLevel: function() {
      if (this.levels[this.currentLevel - 1][this.currentSubLevel]) {
        this.setLevel(this.currentLevel, this.currentSubLevel + 1);
      } else {
        this.setLevel(this.currentLevel + 1, 1);
      }
    }
  };
};
