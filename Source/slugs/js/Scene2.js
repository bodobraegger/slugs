/* 
** GLOBALS **
*/

// 6 categories of hues, hue of 0 and 1 both correspond to red, so cats need to be shifted by half a value
let COLORCATS_HR  = ['red', 'yellow/orange', 'green', 'blue', 'purple', 'pink']
let COLORCATS_360 = [15, 75, 165, 240, 285, 330]
let COLORCATS     = [ 0 ];
for(let i = 0; i < COLORCATS_360.length; i++) {
  COLORCATS.push(COLORCATS_360[i]/360);
}

let ENTITY_TYPES = ['food', 'others']

let TEXTURES = ['smooth', 'spiky']

let SIZES = ['bigger', 'smaller']

RULES = [ ];

let foodIndicesValid = []


class Scene2 extends Phaser.Scene {
  constructor() {
    super("playGame")
  }

  create() {
    this.matter.world.setBounds();
    this.matter.add.mouseSpring();
    //this.matter.enableAttractorPlugin();
    
    // this.cameras.main.setZoom(0.5);
    // this.cameras.main.centerOn(document.getElementById("phaser_container").clientWidth/2, document.getElementById("phaser_container").clientHeight/2);
  

    let circle = this.add.circle(1, 1, 10, 0xFFF000);
    let arc = this.add.arc(100, 100, 50, 1, 180, false, 0xFFF000)
    let rectangle = this.matter.add.gameObject(this.add.rectangle(400, 200, 20, 10, 0x9966ff), this.matter.add.rectangle(400, 200, 20, 10))

    let radius = 20

    let antenna_vertices = `0 0 0 ${2*radius} ${2*radius} ${1.5*radius} ${2*radius} ${0.5*radius}`;
    // let antenna_vertices = [0,0, 0,2*radius, 2*radius,1.5*radius, 2*radius,.5*radius]

    let polygon = this.matter.add.gameObject(this.add.polygon(200, 400, antenna_vertices, 0xFF22FF),  { shape: { type: 'fromVerts', verts: antenna_vertices, flagInternal: true } });
    // polygon = this.matter.add.gameObject(polygon, m_polygon);
    // polygon.setScale(0.2, 0.2);

    let group = this.add.group([circle, arc, rectangle, polygon]);
    group.setAlpha(0.5)

    let matterArc = this.matter.add.trapezoid(1, 1, 10, 20, 0.5);

    let slug_r = 20;
    let slug_x = getCanvasWidth()/2;
    let slug_y = getCanvasHeight()/2;

    let red = new Phaser.Display.Color().setFromHSV(0, 1, 1);
    this.yourSlug = new Slug(this, slug_x, slug_y, slug_r, red);
    let s1 = new Slug(this, slug_x-80, slug_y-5, 10);
    this.slugs = [this.yourSlug, s1];
    
    this.food = [ 
      this.addGameSpriteCircle(0, 0, 10, red.color, 'flower'),
      this.addGameSpriteCircle(getCanvasWidth(), 0, 15, red.color, 'flower'),
      this.addGameSpriteCircle(getCanvasWidth(), getCanvasHeight(), 20, red.color, 'flower'),
      this.addGameSpriteCircle(0, getCanvasHeight(), 25, red.color, 'flower'),
    ];
    
    for(var i = 0; i < 5; i++) {
      let rand = (Math.random()+0.2)*10
      let c =  new Phaser.Display.Color().random().saturate(100);
      
      this.food.push(this.addGameSpriteCircle(c.color%(rand*10), c.color%(rand*10), 5*rand, c.color, 'flower'));
      
      // let s = new Slug(this, slug_x+i*10*rand, slug_y+i*10*rand, (slug_r+20)*rand/10)
      // this.slugs.push(s);
    }
    foodIndicesValid = [...this.food.keys()]
    console.log(foodIndicesValid);
    

    
    // RENDER TERMINAL ON TOP OF PHASER
    // const ph_terminal_container = this.add.dom(0.8*document.getElementById("phaser_container").clientWidth, 0.9*document.getElementById("phaser_container").clientHeight/2, terminal_container)
    // const terminal_input = document.getElementById('terminal_input');

    terminal_input.addEventListener('cmd', (e) => {
      // WE HAVE A HOOK INTO THE TERMINAL
      this.processCommand(e.detail.value);
    });

    // EATING THE FOOD
    this.food.forEach((f, f_index) => {
      // this.slugs.forEach
      [this.yourSlug].forEach(s => { 
        f.setOnCollideWith(s.head, pair => {
          // new CustomEvent('CollisionSlugFood', { 
          //   detail: { a: f, b: s }
          // })
          if(f.radius <= s.head.radius*s.scaleX) {
            if(sameColorClass(f.color, s.color)) {
              if(s.alpha < 1) {
                s.setAlpha(1);
              } else {
                s.setScale(0.3+s.scaleX);
              }
            } else {
              s.setAlpha(0.5);
            }
            f.destroy();
            foodIndicesValid.splice(foodIndicesValid.indexOf(f_index), 1);
            // this.food.splice(f_index);
          } else {
            addToOutput(`the being can't eat anything bigger than it's head :0`)
          }
          
        })
      })
    }); 
    console.log(foodIndicesValid)

  }
  update() {
    let constraints = [ ]
    this.slugs.forEach(e => {
      // SHOW THE SKELETONS OF THE SLUGS
      constraints = constraints.concat(e.jointsBody);
    })
    this.renderConstraint(constraints, 0xF9F6EE, 1, 1, 1, 0xF9F6EE, 1);
    


    /*
    if(this.follow = true) {
      this.cameras.main.scrollX = this.yourSlug.body.x - document.getElementById("phaser_container").clientWidth/2;
      this.cameras.main.scrollY = this.yourSlug.body.y - document.getElementById("phaser_container").clientHeight/2;
    }*/
    // this.slugs.forEach(element => { element.moveRandomly() });
  }

  preload() {
    this.load.scenePlugin({
      key: 'rexuiplugin',
      url: "node_modules/phaser3-rex-plugins/dist/rexuiplugin.min.js",
      sceneKey: 'rexUI'
    });
    this.load.setBaseURL(''); 
    this.load.image('circle', 'assets/circle.png');
    this.load.image('circle_spiky', 'assets/circle_spiky.png');
    this.load.image('flower', 'assets/flower.png');
    this.load.image('square_rounded', 'assets/square_rounded.png');
    this.load.image('circle_leopard', 'assets/circle_leopard.png');
}
  processCommand(input = []) {
    let cmd = input;
    let output = `${wrapCmd(cmd.join(' '))}: `

    if(cmd.length < 1 || cmd[0] == '') { return; }
    
    let cmd0 = cmd[0];
    
    switch (cmd0) {
      case 'if':
        
        let exception_if = `uh oh, an if rule needs to be of the form ${wrapCmd('if <i>condition</i> then <i>action</i>')}, for example: ${wrapCmd('if color is red then eat')}!`;
        if(cmd.length < 6 || !cmd.at(-2) == thenWord || !wordsAction.includes(cmd.at(-1))) { 
          addToOutput(exception_if);
          return;
        }
        let thenIndex = cmd.indexOf(thenWord); 
        let condition = cmd.slice(1, thenIndex);
        let action = cmd.slice(thenIndex+1);
        // console.log(condition);
        // console.log(action);
        RULES.push(cmd.join(' '));
        
        addToOutput(`${wrapCmd(cmd.join(' '))}: your being learned the rule you gave it!`)
        
        break;
        case 'abracadabra':
          this.yourSlug.moveRandomly();
          this.yourSlug.joints.forEach(e=>{
            this.matter.world.removeConstraint(e);
          }); 
          output += `oh no! that was a bad magic trick.`
          addToOutput(output)
          break;
          case 'move':
            this.yourSlug.moveRandomly();
            output += `moving your being around :).`
            addToOutput(output)
            break;
            case 'eat':
              output += `you tell your being to eat.`
              addToOutput(output)
              this.yourSlug.eat();
              break;
        
              
              default:
                addToOutput(colorize(`
              ${wrapCmd(cmd0)} is not a known command.<br> 
              try a different one, or try typing ${wrapCmd('help')}!.
            `, 'rgba(196, 77, 86, 0.2)' )); // new Phaser.Display.Color().random().rgba
          break;
    }
  }

  addGameCircle(x, y, radius, color) {
    let circle = this.add.circle(x, y, radius, color);
    let matterCircle = this.matter.add.circle(x, y, radius);
    return this.matter.add.gameObject(
           circle,
      matterCircle
    )
  }
  addGameSpriteCircle(x, y, radius, color = new Phaser.Display.Color().random().saturate(75).color, source = 'circle') {
    let img = this.add.sprite(x, y, source);
    img.displayWidth = radius*2;
    img.displayHeight = radius*2;
    img.setTint(color);

    let matterCircle = this.matter.add.circle(x, y, radius);
    let o = this.matter.add.gameObject(
           img,
      matterCircle
    ) 
    o.radius = radius;
    o.color = Phaser.Display.Color.IntegerToColor(color);
    return o;
  }

  addGameCircleTextured(x, y, radius, color = new Phaser.Display.Color().random().saturate(75).color, texture = 'circle_leopard') {
    
    let g = this.add.graphics()

    let crcl= this.add.circle(0, 0, radius, color)
    crcl.fillColor=color;
    crcl.removeFromDisplayList()
    
    let txtr = new Phaser.GameObjects.Sprite(this, 0, 0, texture);
    // txtr.displayWidth = 2*radius;
    // txtr.displayHeight = 2*radius;
    
    let mask = new Phaser.Display.Masks.GeometryMask(this, crcl);
    // txtr.setMask(mask);
    
    let rt = this.add.renderTexture(x, y, radius*2, radius*2);
    rt.draw(crcl, radius, radius);
    rt.draw(txtr, radius, radius);
    rt.setMask(mask);
    // let c = this.add.container(x, y, [crcl, txtr, ]);
    
    let matterCircle = this.matter.add.circle(x, y, radius);


    let o = this.matter.add.gameObject(
           rt,
      matterCircle
    ) 
    o.radius = radius;
    o.arc=crcl;
    o.textureType= texture.includes('spiky') ? 'spiky':'smooth';
  
    // SHOW THE SKELETONS OF THE SLUGS
    // TO ENSURE CIRCULAR MASKS ON THE TEXTURE FILES, IF PERFORAMCE HOG JUST CUT OUT THE TEXTURES BY HAND
    this.events.on('postupdate', function() {
      crcl.copyPosition(rt)
    }, this);

    return o;
  }



  renderConstraint(constraints, lineColor, lineOpacity, lineThickness, pinSize, anchorColor, anchorSize) {
    if (!this.graphics) {
      this.graphics = this.add.graphics();
    }
  
    this.graphics.clear();
    for(var i=0, n=constraints.length; i<n; i++) {
      this.matter.world.renderConstraint(constraints[i], this.graphics, lineColor, lineOpacity, lineThickness, pinSize, anchorColor, anchorSize);
    }
  }
  
}

class Slug extends Phaser.GameObjects.Container {
  constructor(scene=Scene2, x=0, y=0, radius=20, color=new Phaser.Display.Color().random().saturate(75)) {
    super(scene, x, y);
    this.setDataEnabled();
    this.data.values.color = color;
    this.color = color
    let headColor = this.color.clone().lighten((Math.min(0.2+Math.random(), 0.8))*50);
    let tailColor = this.color.clone().lighten((Math.min(0.1+Math.random(), 0.8))*30);

    this.head   = this.scene.addGameCircle(x, y, radius/1.5, headColor.color);
    this.body   = this.scene.addGameCircleTextured(x-radius+radius/1.5, y, radius, this.color.color);
    this.tail_0 = this.scene.addGameCircle(x-radius+radius/1.5-(radius+radius/1.3), y, radius/1.3, tailColor.color);
    this.tail_1 = this.scene.addGameCircle(x-radius+radius/1.5-((radius+radius/1.3)+(radius/1.3+radius/2)), y, radius/2, tailColor.color);

    
    this.headjoint  = this.scene.matter.add.joint(
      this.head, this.body, 
      4+(this.head.radius+this.body.radius)/2, 0.6, 
      { damping:0.1,
        pointA: {x: this.head.radius/2, y: 0}, 
        pointB: {x: this.body.radius/2, y: 0} }
    ); // , {pointA: {x: this.body.radius/2, y: 0}}
    this.bodyjoint  = this.scene.matter.add.joint(
      this.body, this.tail_0, 
      4+(this.body.radius+this.tail_0.radius)/2, 0.6,
      { pointA: {x: -this.body.radius/2, y: 0}, 
        pointB: {x: -this.tail_0.radius/2, y: 0} }
    );
    this.tailjoint  = this.scene.matter.add.joint(
      this.tail_0, this.tail_1, 
      4+(this.tail_0.radius+this.tail_1.radius)/2, 0.6,
      { pointA: {x: this.tail_0.radius/2, y: 0}, 
        pointB: {x: this.tail_1.radius/2, y: 0} }
    );
    this.headjoint.angularStiffness = 0.8;
    let antennaeColor = this.head.fillColor;
 
     
     let antennaLength = this.head.radius;
    let a1 = this.scene.matter.add.gameObject(
      this.scene.add.rectangle(x+this.head.radius*2, y, antennaLength, antennaLength/4, antennaeColor),
      this.scene.matter.add.rectangle(x+this.head.radius*2, y, antennaLength, antennaLength/4)
    )
    let a2 = this.scene.matter.add.gameObject(
      this.scene.add.rectangle(x+this.head.radius*2, y, antennaLength, antennaLength/4, antennaeColor),
      this.scene.matter.add.rectangle(x+this.head.radius*2, y, antennaLength, antennaLength/4)
    )

    this.antennaeJoints = [
      // this.scene.matter.add.joint(a1, a2, antennaLength/2, 0.5, {pointA: {x: antennaLength/2, y: 0}, pointB: {x: antennaLength/2, y: 0}}),
      this.scene.matter.add.joint(this.head, a1, 5, 0.5, {damping:0.1, pointA: {x: -this.head.radius, y: -this.head.radius/4}, pointB: {x: antennaLength/2, y: 0}}),
      this.scene.matter.add.joint(this.head, a2, 5, 0.5, {damping:0.1,pointA: {x: -this.head.radius, y: this.head.radius/4}, pointB: {x: antennaLength/2, y: 0}}),
      this.scene.matter.add.joint(a1, a2, 4+antennaLength, 0.5, {damping:0.1,pointA: {x: -antennaLength/2, y: 0}, pointB: {x: -antennaLength/2, y: 0}}),
      this.scene.matter.add.joint(a1, a2, 4+antennaLength*1.5, 0.5, {damping:0.1,pointA: {x: -antennaLength/2, y: 0}, pointB: {x: antennaLength/2, y: 0}}),
      this.scene.matter.add.joint(a2, a1, 4+antennaLength*1.5, 0.5, {damping:0.1,pointA: {x: -antennaLength/2, y: 0}, pointB: {x: antennaLength/2, y: 0}}),
      
    ]

    this.jointsBody = [
      this.headjoint,
      this.bodyjoint,
      this.tailjoint
    ]
    this.joints = [...this.jointsBody]
    this.antennaeJoints.forEach(e=> {
      this.joints.push(e)
    });

    this.joints.forEach(e => {
      e.originalLength = e.length;
    })



    let antennae = [a1, a2]
    antennae.forEach(e => {
      e.setCollisionCategory(null);
    });

    this.antennae = this.scene.add.group(antennae)
    this.a1 = a1;
    this.a2 = a2;
    this.head.body.inertia=Infinity;
    this.a1.body.inertia=Infinity;
    this.a2.body.inertia=Infinity;
    this.bodyparts = [this.a1, this.a2, this.head, this.body, this.tail_0, this.tail_1];
    this.bodyparts.forEach((e, i) => {
      // e.setCollisionGroup(i*this.scene.GameObjects.length);
      // e.setCollidesWith(0);
      // this.add(e);
    })
    this.list = this.bodyparts // + this.joints;
    this.alpha = 1;
    this.tint = color.color;
    this.scaleX = 1;
    this.scaleY = 1;
  }
  
  setAlpha(a) {
    this.list.forEach(element => {
      element.setAlpha(a);
    });
    this.alpha = a;
  }
  
  setTint(t) {
    this.list.forEach(element => {
      try { element.setTint(t); }
      catch {
        element.fillColor = t;
      }
    });
    this.tint = t;
  }

  setScale(sX, sY=undefined) {
    this.scaleX = sX;
    (sY) ? this.scaleY = sY : this.scaleY = sX;
    this.list.forEach(element => {
      element.setScale(sX, sY);
      if(element.type == 'RenderTexture' ) {
        let rt = element;
        let crcl = rt.arc;
        
        rt.clearMask(true);
        crcl.setScale(sX, sY);
        let mask = new Phaser.Display.Masks.GeometryMask(this, crcl);
        // rt.draw(crcl, radius, radius);
        // rt.draw(txtr, radius, radius);
        rt.setMask(mask);
      }
    });

    for(let i = 0; i < this.jointsBody.length; i++) {
      let j = this.jointsBody[i];
      let diff = sX-1;
      j.length = j.originalLength+diff*j.originalLength;
    }

  }

  moveRandomly() {
    this.scene.matter.applyForce(this.head, {x: getRandomInclusive(-0.2, 0.2), y: getRandomInclusive(-0.2, 0.2)})
  }

  eat(foodType='any') {
    
    if(RULES.length) {
      addToOutput(`first, the being thinks of the rules you gave it.`)
    }
    
    let rulesFood = [];
    
    let foodMatching = [ ];
    
    for(let i = 0; i < RULES.length; i++) {
      let ifColor = false;
      let ifTexture = false;
      let ifSize = false;
      let avoid = false;
      let r = RULES[i].split(" ");
      let type = r.at(1);
      avoid = (r.at(-1) == 'avoid');
      if(type == 'food') {
        let booleanExpr = r.slice(1,r.length-2);
        
        booleanExpr.forEach((e, i) => {
          if(wordsIfConditionRight.includes(e)) {
            booleanExpr[i] = `'${e}'`
          }
          if(COLORCATS_HR.includes(e)) {
            ifColor = true;
          }
          if(TEXTURES.includes(e)) {
            ifTexture = true;
          }
          if(SIZES.includes(e)) {
            ifSize = true;
          }
        });
        rulesFood.push({
          booleanExpr: booleanExpr,
          ifColor: ifColor,
          ifTexture: ifTexture,
          ifSize: ifSize,
          avoid: avoid,
        });
      }
    }

    if(rulesFood.length) {
      addToOutput(`it remembers the following food rules:`)
      for(let i = 0; i < rulesFood.length; i++) {
        let r = rulesFood[i]; 
        let booleanExpr = r.booleanExpr;
        let booleanString = booleanExpr.join(' '); // .splice(1, 0, '(').push(')')
        addToOutput(`${booleanString.replaceAll("'", "")}`)
        booleanString = booleanString.replaceAll(equalWord, '==').replaceAll(andWord, '&&').replaceAll(` ${orWord}`, ` ||`);


        for(let i = 0; i < foodIndicesValid.length; i++) {
          let f = this.scene.food[ foodIndicesValid[i] ];
          // VARIABLE NAME NEEDS TO BE SAME AS INPUT!!
          let food = '';
          if(r.ifColor) {
            food = COLORCATS_HR[getColorClass(f.color)];
          }
          if(r.ifSize) {
            food = (this.radius*this.scaleX < f.radius ? 'smaller':'bigger' )
          }
          if(r.ifTexture) {
            food = f.textureType;
          }
          console.log(booleanString, food);
          let evaluation = eval(booleanString);
          console.log(evaluation);
          if(evaluation) {
            foodMatching.push(f);
          }          
        }
      }
    }
    else {
      addToOutput('none of the rules tell your being what to eat, so it will try to eat anything!')
      for(let i=0;i<foodIndicesValid.length;i++) {
        foodMatching.push(this.scene.food[ foodIndicesValid[i] ]);
      }
    }
    let closestMatch = findClosest(this.head, foodMatching);
    console.log(closestMatch);
    let vels = velocityToTarget(this.head, closestMatch, 10);
    // console.log(vels)
    this.head.setVelocity(vels.velX, vels.velY);
  }

}

class Antenna extends Phaser.GameObjects.Group {
  constructor(scene, x, y, radius, color) {
    super(scene, []);
    this.classType = Phaser.GameObjects.Arc;
    this.radius = radius;
    this.color = color;
    for(let i = 0; i < 3; i++) {
      let c = this.scene.addGameCircle(x, y, radius, color);
      this.add(c);
      x = x + radius;
    }
    for(let i = 0; i < this.children.size-1; i++) {
      this.scene.matter.add.joint(this.getChildren().at(i), this.getChildren().at(i+1), radius*2, 0.3); 
    }
    // this.scene.matter.add.joint(this.getChildren().at(0), this.getChildren().at(-1), radius * (this.children.size+1), 0.1)
  }
}


function getRandomInclusive(min, max) {
  return Math.random() * (max - min) + min; //The maximum is inclusive and the minimum is inclusive
}



class Food extends Phaser.GameObjects.Polygon {
    constructor(scene, x, y, radius, color) {
        super(scene, x, y, )
    }
}

const velocityToTarget = (from, to, speed = 1) => {
  console.log(from.x, from.y, to.x, to.y)
  const direction = Math.atan((to.x - from.x) / (to.y - from.y));
  const speed2 = to.y >= from.y ? speed : -speed;
 
  return { velX: speed2 * Math.sin(direction), velY: speed2 * Math.cos(direction) };
};

function sameColorClass(color1, color2) { // color blindness: https://colororacle.org/?
  let cat1=-1; let cat2 = -1;
  let i = 0;
  for(i = 0; i < COLORCATS.length; i++) {
    if(color1.h - COLORCATS[i] >= 0) {
      cat1 = i % (COLORCATS.length-1);
    } 
    if(color2.h - COLORCATS[i] >= 0) {
      cat2 = i % (COLORCATS.length-1);
    }
  }
  let colorDiff = Math.min(Math.abs(color1.h - color2.h), Math.abs(COLORCATS[cat1] - color2.h), Math.abs(COLORCATS[cat2] - color1.h));
  let similarityBound = 0.2 * (color1.h + color2.h)/2
  console.log('color.h:', color1.h, color2.h,'| dff:', colorDiff, 'similarityBound:', similarityBound)
  console.log('cat:', COLORCATS_HR[cat1], COLORCATS_HR[cat2])

  if(cat1 == cat2 || colorDiff <= similarityBound) {
    return true;
  }
  else {
    return false;
  }
}

function getColorClass(color) {
  let cat1 = -1;
  let i = 0;
  for(i = 0; i < COLORCATS.length; i++) {
    if(color.h - COLORCATS[i] >= 0) {
      cat1 = i % (COLORCATS.length-1);
    } 
  }
  return cat1;
}

class Rule {
  constructor(condition = [], action = []) {
    this.condition = condition;
    this.action = action;
  }
}

function getCanvasHeight() {
  return document.getElementById("phaser_container").clientHeight;
}

function getCanvasWidth() {
  return document.getElementById("phaser_container").clientWidth;
}

function findClosest(A, B=[new Phaser.GameObjects.GameObject()]) {
  let distance = Infinity;
  let closest;
  B.forEach(e=> {
    // distance squared is faster
    currentDistance = Phaser.Math.Distance.BetweenPointsSquared({x: A.x, y: A.y}, {x: e.x, y: e.y});
    if(currentDistance < distance) {
      distance = currentDistance;
      closest = e;
    }
  })
  return closest;
}