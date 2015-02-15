var progress = [];
module.exports = {
  saveLevelProgress: function(level, sublevel, data) {
    if(!progress[level - 1]) {
      progress[level - 1] = [];
    }
    // only save progress if it is better than a previous score
    if(this.getLevelProgress(level, sublevel).score < data.score) {
      progress[level - 1][sublevel - 1] = data;
    }
  },
  getLevelProgress: function(level, sublevel) {
    if(!progress[level - 1]) {
      progress[level - 1] = [];
    }
    if(!progress[level - 1][sublevel - 1]) {
      progress[level - 1][sublevel - 1] = {score:0, stars:0};
    }
    return progress[level - 1][sublevel - 1];
  },
  // level status:
  // levels with 2+ stars are COMPLETE
  // levels with < 2 stars are READY
  // levels immediately after a completed level are READY
  // all others are LOCKED
  // execpt very fist level/sublevel starts out READY
  getLevelStatus: function(level, sublevel) {
    if (this.getLevelProgress(level, sublevel).score > 0) {
      // level has a score
      if(this.getLevelProgress(level, sublevel).stars >= 2) {
        return this.COMPLETE;
      } else {
        return this.READY;
      }
    } else if (level === 1 && sublevel === 1) {
      // very first level/sublevel
      return this.READY;   
    } else if (sublevel >= 1) {
      // any sublevel higher than 1
     if (this.getLevelStatus(level, sublevel - 1) === this.COMPLETE) {
       return this.READY;
     } else {
       return this.LOCKED;
     }
    } else {
      // first stublevel of a level higher than 1
      var subLevelsPerLevel = 6;
     if (this.getLevelStatus(level - 1, subLevelsPerLevel) === this.COMPLETE) {
       return this.READY;
     } else {
       return this.LOCKED;
     }
    }
  },
  LOCKED: 0,
  READY: 1,
  COMPLETE: 2
};
