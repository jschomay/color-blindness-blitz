module.exports = function(game) {
  function fillStars(width, num, graphics){
    if (typeof graphics === "undefined") {
      var graphics = game.add.graphics(0,0);
    }
    return _drawStars(graphics, width, num);
  }

  function drawEmptyStars(width, graphics){
    if (typeof graphics === "undefined") {
      var graphics = game.add.graphics(0,0);
    }
    return _drawStars(graphics, width, 3, true);
  }

  function drawStars(width, num) {
    var graphics = game.add.graphics(0,0);
    drawEmptyStars(width, graphics);
    fillStars(width, num, graphics);
    return graphics;
  }

  function _drawStars(graphics, width, num, empty) {
    if (typeof num === "undefined") {
      num = 3;
    }
    var starColors = [
      "blue",
      "purple",
      "green",
    ];
    var alpha = empty ? 0.2 : 1;
    for (var i = 0; i < num; i++) {
      var position = {x: width * (i + 1) / 4, y: 0};
      var starWidth = width / 10;
      drawStar.call(this, graphics, position.x, position.y, starWidth, game.COLORS[starColors[i]], alpha);
    }
    return graphics;
  };

  // thanks to http://stackoverflow.com/questions/25837158/how-to-draw-a-star-by-using-canvas-html5
  function drawStar(graphics, cx,cy, width, color, alpha){
    var spikes = 5;
    var outerRadius = width;
    var innerRadius = outerRadius / 3;
    var rot=Math.PI/2*3;
    var x=cx;
    var y=cy;
    var step=Math.PI/spikes;

    graphics.beginFill(color, alpha);
    graphics.moveTo(cx,cy-outerRadius);
    for(i=0;i<spikes;i++){
      x=cx+Math.cos(rot)*outerRadius;
      y=cy+Math.sin(rot)*outerRadius;
      graphics.lineTo(x,y);
      rot+=step;

      x=cx+Math.cos(rot)*innerRadius;
      y=cy+Math.sin(rot)*innerRadius;
      graphics.lineTo(x,y);
      rot+=step;
    }
    graphics.lineTo(cx,cy-outerRadius);
  }
  return {
    drawEmptyStars: drawEmptyStars,
    fillStars: fillStars,
    drawStars: drawStars
  };
}


