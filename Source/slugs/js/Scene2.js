let red = Phaser.Display.Color.HexStringToColor("0xff0000")
let blue = Phaser.Display.Color.HexStringToColor("0x0000ff")
let green = Phaser.Display.Color.HexStringToColor("0x00FF00")
let yellow = Phaser.Display.Color.HexStringToColor("0xffff00")
let magenta = Phaser.Display.Color.HexStringToColor("0xff00ff")
let cyan = Phaser.Display.Color.HexStringToColor("0x00ffff")

let COLORS = [
  red,
  blue,
  green,
  yellow,
  magenta,
  cyan,
]

let COLORCATS = [ 0 ];
for(let i = 0; i < 8; i++) {
  COLORCATS[i] = i*1/8;
}

class Scene2 extends Phaser.Scene {
  constructor() {
    super("playGame")
  }

  create() {
    this.add.text(20, 20, "playing...", {
      font: '25px Mono',
      fill: 'red'
    })
    this.matter.world.setBounds();
    this.matter.add.mouseSpring();
    
    // this.cameras.main.setZoom(0.5);
    // this.cameras.main.centerOn(document.getElementById("phaser_container").clientWidth/2, document.getElementById("phaser_container").clientHeight/2);
  

    let circle = this.add.circle(1, 1, 10, 0xFFF000);
    let arc = this.add.arc(100, 100, 50, 1, 180, false, 0xFFF000)
    let rectangle = this.matter.add.gameObject(this.add.rectangle(400, 200, 20, 10, 0x9966ff), this.matter.add.rectangle(400, 200, 20, 10))

    let radius = 100

    let antenna_vertices = `0 0 0 ${2*radius} ${2*radius} ${1.5*radius} ${2*radius} ${0.5*radius}`;
    // let antenna_vertices = [0,0, 0,2*radius, 2*radius,1.5*radius, 2*radius,.5*radius]

    let polygon = this.matter.add.gameObject(this.add.polygon(200, 400, antenna_vertices, 0xFF22FF),  { shape: { type: 'fromVerts', verts: antenna_vertices, flagInternal: true } });
    //polygon = this.matter.add.gameObject(polygon, m_polygon);

    let group = this.add.group([circle, arc, rectangle, polygon]);
    group.setAlpha(0.5)

    let matterArc = this.matter.add.trapezoid(1, 1, 10, 20, 0.5);

    let slug_r = 20;
    let slug_x = document.getElementById("phaser_container").clientWidth/2;
    let slug_y = document.getElementById("phaser_container").clientHeight/2;

    this.yourSlug = new Slug(this, slug_x, slug_y, slug_r);
    let s1 = new Slug(this, slug_x-80, slug_y-5, 15);
    this.slugs = [this.yourSlug, s1];
    s1.setAlpha(0.9); 
    
    let poison = [ ];

    for(var i = 0; i < 10; i++) {
      var c =  new Phaser.Display.Color().random();
      poison.push(this.addGameSpriteCircle(100, 100, 20, c.color, 'circle_spiky'));
      poison[i].color = c;

      let rand = (Math.random()+0.2)*10
      let s = new Slug(this, slug_x+i*10*rand, slug_y+i*10*rand, (slug_r+20)*rand/10)
      this.slugs.push(s);
    }
    

    
    // RENDER TERMINAL ON TOP OF PHASER
    const terminal_container = document.getElementById('terminal_container');
    // const ph_terminal_container = this.add.dom(0.8*document.getElementById("phaser_container").clientWidth, 0.9*document.getElementById("phaser_container").clientHeight/2, terminal_container)
    const terminal_input = document.getElementById('terminal_input');

    terminal_input.addEventListener('cmd', (e) => {
      // WE HAVE A HOOK INTO THE TERMINAL
      this.processCommand(e.detail.value);
    });

    poison.forEach(x => {
      this.slugs.forEach(s => {
        x.setOnCollideWith(s.head, pair => {
          // TODO: REWORK THIS TO USE BODY COLOR OR SO FOR X
          if(this.sameColorClass(x.color, s.color)) {
            s.setAlpha(1);
          } else {
            s.setAlpha(0.5);
            s.setTint(s.color.clone().darken(10).color)
          }
        })
      })
    }); 

  }
  update() {
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
    this.load.image('circle', 'assets/circle.png');
    this.load.image('circle_spiky', 'assets/circle_spiky.png');
    this.load.image('flower', 'assets/flower.png');
    this.load.image('square_rounded', 'assets/square_rounded.png');
}
  processCommand(input) {
    let cmd = input.trim().split(/\s+/);
    console.log('processing command: ', cmd);
    if(cmd.length < 1 || cmd[0] == '') { return; }
    if(cmd[0] == 'abracadabra') {
      this.yourSlug.moveRandomly();
      this.yourSlug.joints.forEach(e=>{
        this.matter.world.removeConstraint(e);
      }); 
    }
    if(cmd[0] == 'move') {
      this.yourSlug.moveRandomly();
    }
    if(cmd[0] == 'follow') [
      this.follow = true
    ]
  }

  addGameCircle(x, y, radius, color) {
    let circle = this.add.circle(x, y, radius, color);
    let matterCircle = this.matter.add.circle(x, y, radius);
    return this.matter.add.gameObject(
           circle,
      matterCircle
    )
  }
  addGameSpriteCircle(x, y, radius, color = new Phaser.Display.Color().random().color, source = 'circle') {
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
    return o;
  }

  sameColorClass(color1, color2) {
    let cat1, cat2 = 0;
    COLORCATS.forEach( (e, i) => {
      if(e - color1.h > 0) {
        cat1 = i;
      }
      if(e - color2.h > 0) {
        cat2 = i;
      }
      
    })
    if(cat1 == cat2) {
      return true;
    }
    else {
      return false;
    }
  }
}

class Slug extends Phaser.GameObjects.GameObject {
  constructor(scene, x, y, radius) {
    super(scene, x, y);
    this.color = new Phaser.Display.Color().random();
    let headColor = this.color.clone().lighten((Math.min(0.2+Math.random(), 0.8))*50);
    let tailColor = this.color.clone().lighten((Math.min(0.1+Math.random(), 0.8))*30);

    this.head   = this.scene.addGameCircle(x, y, radius/1.5, headColor.color);
    this.body   = this.scene.addGameSpriteCircle(x-radius+radius/1.5, y, radius, this.color.color);
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

    this.joints = [
      this.headjoint,
      this.bodyjoint,
      this.tailjoint
    ]
    this.antennaeJoints.forEach(e=> {
      this.joints.push(e);
    });


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
    })
    this.children = this.bodyparts + this.joints;
  }

  moveRandomly() {
    this.scene.matter.applyForce(this.head, {x: getRandomInclusive(-0.2, 0.2), y: getRandomInclusive(-0.2, 0.2)})
  }

  setAlpha(a) {
    this.bodyparts.forEach(element => {
      element.setAlpha(a);
    });
  }

  setTint(t) {
    this.bodyparts.forEach(element => {
      try { element.setTint(t); }
      catch {
        element.fillColor = t;
      }
    });
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