function velocityToTarget(from, to, speed = 1) {
    // console.log(from.x, from.y, to.x, to.y)
    const direction = Math.atan((to.x - from.x) / (to.y - from.y));
    const speed2 = to.y >= from.y ? speed : -speed;
    
    return new Vector2({ x: speed2 * Math.sin(direction), y: speed2 * Math.cos(direction) });
};
  
function velocityFacing(obj, speed = 1, offset=0) {
  return new Vector2(Vector2.ONE).setAngle(obj.rotation+DegToRad(offset)).setLength(speed);
}

function velocityLeft(obj, speed = 1) {
    return new Vector2(Vector2.ONE).setAngle(obj.rotation-DegToRad(90)).setLength(speed);
}

function velocityRight(obj, speed = 1) {
    return new Vector2(Vector2.ONE).setAngle(obj.rotation+DegToRad(90)).setLength(speed);
}

function drawVec(vector, start, color, weight) {
    SCENE.graphics
      .lineStyle(weight, color)
      .lineBetween(
        start.x,
        start.y,
        start.x + vector.x,
        start.y + vector.y
      );
}