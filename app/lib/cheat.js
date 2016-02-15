var levels = require("../levels");
module.exports = function() {
  if(confirm("Cheat mode activated, this will unlock all levels, but you will lose any existing high scores, do you want to continue?")) {
    var progress = [];
    for (var i = 0; i < levels.length; i++) {
      var levelProgress = [];
      for (var j = 0; j < levels[0].length; j++) {
        levelProgress.push({"score": 99, "stars": 1});
      }
      progress.push(levelProgress);
    }
    localStorage.setItem('cbb_progress', JSON.stringify(progress));
    window.location.href = window.location.href;
  }
}
