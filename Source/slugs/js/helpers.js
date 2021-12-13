function getCanvasHeight() {
    return document.getElementById("phaser_container").clientHeight;
}
  
function getCanvasWidth() {
    return document.getElementById("phaser_container").clientWidth;
}
  
function pointOnCircle(x=0, y=0, radius=10, angle=0.5) {
    let p = new Phaser.Math.Vector2(x + radius * Math.cos(angle),
    y + radius * Math.sin(angle));
    return p;
}