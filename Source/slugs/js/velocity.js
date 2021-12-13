function velocityToTarget(from, to, speed = 1) {
    // console.log(from.x, from.y, to.x, to.y)
    const direction = Math.atan((to.x - from.x) / (to.y - from.y));
    const speed2 = to.y >= from.y ? speed : -speed;
    
    return new Phaser.Math.Vector2({ x: speed2 * Math.sin(direction), y: speed2 * Math.cos(direction) });
};
  
function velocityFacing(obj, speed = 1, offset=0) {
  return new Phaser.Math.Vector2(Phaser.Math.Vector2.ONE).setAngle(obj.rotation+Phaser.Math.DegToRad(offset)).setLength(speed);
}

function velocityLeft(obj, speed = 1) {
    return new Phaser.Math.Vector2(Phaser.Math.Vector2.ONE).setAngle(obj.rotation-Phaser.Math.DegToRad(90)).setLength(speed);
}

function velocityRight(obj, speed = 1) {
    return new Phaser.Math.Vector2(Phaser.Math.Vector2.ONE).setAngle(obj.rotation+Phaser.Math.DegToRad(90)).setLength(speed);
}
