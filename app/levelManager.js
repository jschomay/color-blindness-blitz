module.exports = function (game) {
  var levels = require("./levels");
  return {
    currentLevel: 1,
    currentSubLevel: 1,
    numLevels: levels.length,
    isNextLevel: function(levelNum){
      levelNum = levelNum || this.currentLevel;
      return levelNum + 1 <= this.numLevels;
    },
    isPreviousLevel: function(levelNum){
      levelNum = levelNum || this.currentLevel;
      return levelNum > 1;
    },
    isGameWin: function(){
      return !this.isNextLevel() && this.currentSubLevel === 6;
    },
    getLevel: function(level) {
      return levels[level - 1];
    },
    setLevel: function(level, subLevel) {
      this.currentLevel = level;
      this.currentSubLevel = subLevel;
      game.currentLevel = levels[this.currentLevel - 1][this.currentSubLevel - 1];
    },
    nextLevel: function() {
      if (levels[this.currentLevel - 1][this.currentSubLevel]) {
        this.setLevel(this.currentLevel, this.currentSubLevel + 1);
      } else {
        this.setLevel(this.currentLevel + 1, 1);
      }
    }
  };
};
