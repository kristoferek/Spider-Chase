var Vector = function([[x1, y1], [x2, y2]]){
    this.origin = [x1, y1];
    this.destination = [x2, xy];
}
function Vector.prototype.containObstacle(){
  var stepX = 0;
  var stepY = 0;

  if (origin[0] < destination[0]) {
    stepX = 1;
  } else if (origin[0] > destination[0]) {
    stepX = -1;
  }

  if (origin[1] < destination[1]) {
    stepY = 1;
  } else if (origin[1] > destination[1]) {
    stepY = -1;
  }

  for (var x = origin[0]; x <= destination[0]; x + stepX){
    for (var i = 0; i < array.length; i++) {
      array[i]
    }

    }
  }
}

function buildPath(vector, fieldArr, obstacles){
  var path = vector;
  if path.vectorContainObstacle(){
    getCloserObstacleCorner
    split path
  } else {
    return path;
  }
}

set direction

function getDistance([x1, y1], [x2, y2]){
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
