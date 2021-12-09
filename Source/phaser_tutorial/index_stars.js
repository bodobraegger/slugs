var STAR_COUNT = (window.innerWidth + window.innerHeight) / 16,
STAR_SIZE = 16,
STAR_MIN_SCALE = 0.2,
OVERFLOW_THRESHOLD = 5;

var canvas = document.querySelector('canvas'),
context = canvas.getContext('2d');

var scale = 1, // device pixel ratio
width = void 0,
height = void 0;

var stars = [];

var pointerX = void 0,
pointerY = void 0;

var velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0005 };

var touchInput = false;

generate();
resize();
step();

window.onresize = resize;
canvas.onmousemove = onMouseMove;
canvas.ontouchmove = onTouchMove;
canvas.ontouchend = onMouseLeave;
document.onmouseleave = onMouseLeave;

function generate() {

  for (var i = 0; i < STAR_COUNT; i++) {
    stars.push({
        head: {
            x: 0,
            y: 0,
        },
        torso: {
            x: 0,
            y: 0,
        },
        tail: {
            x: 0,
            y: 0,
        },
      z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
      color: `rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${(0.7 + 0.3 * Math.random())})`,
    });

  }

}

function placeStar(star) {

  star.torso.x = Math.random() * width;
  star.torso.y = Math.random() * height;

}

function recycleStar(star) {

  var direction = 'z';

  var vx = Math.abs(velocity.x),
  vy = Math.abs(velocity.y);

  if (vx > 1 || vy > 1) {
    var axis = void 0;

    if (vx > vy) {
      axis = Math.random() < vx / (vx + vy) ? 'h' : 'v';
    } else
    {
      axis = Math.random() < vy / (vx + vy) ? 'v' : 'h';
    }

    if (axis === 'h') {
      direction = velocity.x > 0 ? 'l' : 'r';
    } else
    {
      direction = velocity.y > 0 ? 't' : 'b';
    }
  }

  star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

  if (direction === 'z') {
    star.z = 0.1;
    star.torso.x = Math.random() * width;
    star.torso.y = Math.random() * height;
  } else
  if (direction === 'l') {
    star.torso.x = -OVERFLOW_THRESHOLD;
    star.torso.y = height * Math.random();
  } else
  if (direction === 'r') {
    star.torso.x = width + OVERFLOW_THRESHOLD;
    star.torso.y = height * Math.random();
  } else
  if (direction === 't') {
    star.torso.x = width * Math.random();
    star.torso.y = -OVERFLOW_THRESHOLD;
  } else
  if (direction === 'b') {
    star.torso.x = width * Math.random();
    star.torso.y = height + OVERFLOW_THRESHOLD;
  }

}

function resize() {

  scale = window.devicePixelRatio || 1;

  width = window.innerWidth * scale;
  height = window.innerHeight * scale;

  canvas.width = width;
  canvas.height = height;

  stars.forEach(placeStar);

}

function step() {

  context.clearRect(0, 0, width, height);

  update();
  render();

  requestAnimationFrame(step);

}

function update() {
    velocity.tx *= 0.96;
    velocity.ty *= 0.96;
    
    velocity.x += (velocity.tx - velocity.x) * 0.5;
    velocity.y += (velocity.ty - velocity.y) * 0.5;
    
    stars.forEach(function (star) {
      let r = 1-(0.5*Math.random());

    star.torso.x += velocity.x * star.z * Math.random()*r;
    star.torso.y += velocity.y * star.z * Math.random()*r;

    // drift
    star.torso.x += (star.torso.x - width / 2) * velocity.z * star.z;
    star.torso.y += (star.torso.y - height / 2) * velocity.z * star.z;
    //star.z += velocity.z;

    // recycle when out of bounds
    if (star.torso.x < -OVERFLOW_THRESHOLD || star.torso.x > width + OVERFLOW_THRESHOLD || star.torso.y < -OVERFLOW_THRESHOLD || star.torso.y > height + OVERFLOW_THRESHOLD) {
      recycleStar(star);
    }

  });

}

function render() {

  stars.forEach(function (star) {

    context.beginPath();
    context.lineCap = 'round';
    context.lineWidth = STAR_SIZE * star.z * scale;
    context.strokeStyle = star.color;

    
        var tailX = velocity.x * 2,
        tailY = velocity.y * 2;
        
        // stroke() wont work on an invisible line
        if (Math.abs(tailX) < 0.1) tailX = 0.5;
        if (Math.abs(tailY) < 0.1) tailY = 0.5;
    
    // context.moveTo(star.torso.x, star.torso.y);
    // context.lineTo(star.torso.x + tailX, star.torso.y + tailY);

    let rgba_orig = star.color.match(/[\d.]+/g);
    let radius = 2 * STAR_SIZE * star.z * scale;

    context.beginPath();
    context.arc(star.torso.x-0.5*tailX, star.torso.y-0.5*tailY, 0.6*radius, 0, 2*Math.PI)
    let rgba_new = rgba_orig.slice(),
        o = -150;
    rgba_new[0] = parseInt(rgba_orig[0])+o;
    context.fillStyle = `rgba(${ rgba_new.join(',') })`;
    context.fill();   

    context.beginPath();
    context.arc(star.torso.x-1*tailX, star.torso.y-1*tailY, 0.3*radius, 0, 2*Math.PI)
        rgba_new = rgba_orig.slice(),
        o = -100;
    rgba_new[1] = parseInt(rgba_orig[2])+o;
    context.fillStyle = `rgba(${ rgba_new.join(',') })`;
    context.fill();      


    
    context.arc(star.torso.x, star.torso.y, radius, 0, 2*Math.PI)
    context.fillStyle = star.color;
    context.fill();

    context.beginPath();
    context.arc(star.torso.x+0.5*tailX, star.torso.y+0.5*tailY, 0.7*radius, 0, 2*Math.PI)
        rgba_new = rgba_orig.slice(),
        o = 150;
    rgba_new[0] = parseInt(rgba_orig[0])+o;
    rgba_new[1] = parseInt(rgba_orig[1])+o;
    rgba_new[2] = parseInt(rgba_orig[2])+o;
    context.fillStyle = `rgba(${ rgba_new.join(',') })`;
    context.fill();


    let d = 1
    // context.moveTo(star.torso.x, star.torso.y);
    // context.lineTo(star.torso.x + d, star.torso.y);
    // context.lineTo(star.torso.x + d, star.torso.y + d);
    // context.lineTo(star.torso.x, star.torso.y + d);
    // context.lineTo(star.torso.x, star.torso.y);
    // context.stroke();

  });

}

function movePointer(x, y) {

  if (typeof pointerX === 'number' && typeof pointerY === 'number') {

    var ox = x - pointerX,
        oy = y - pointerY;

    velocity.tx = velocity.tx + ox / 8 * scale * (touchInput ? 1 : -1);
    velocity.ty = velocity.ty + oy / 8 * scale * (touchInput ? 1 : -1);

  }

  pointerX = x;
  pointerY = y;

}

function onMouseMove(event) {

  touchInput = false;

  movePointer(event.clientX, event.clientY);

}

function onTouchMove(event) {

  touchInput = true;

  movePointer(event.touches[0].clientX, event.touches[0].clientY, true);

  event.preventDefault();

}

function onMouseLeave() {

  pointerX = null;
  pointerY = null;

}