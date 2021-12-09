function getRandomInclusive(min, max) {
    return Math.random() * (max - min) + min; //The maximum is inclusive and the minimum is inclusive
}
  
function getCanvasHeight() {
    return document.getElementById("phaser_container").clientHeight;
}
  
function getCanvasWidth() {
    return document.getElementById("phaser_container").clientWidth;
}
  