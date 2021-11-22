
// 6 categories of hues, hue of 0 and 1 both correspond to red, so cats need to be shifted by half a value
let COLORCATS_HR  = ['red', 'yellow/orange', 'green', 'blue', 'purple', 'pink']
let COLORCATS_360 = [15, 75, 150, 240, 285, 330]
let COLORCATS     = [ 0 ];
for(let i = 0; i < COLORCATS_360.length; i++) {
  COLORCATS.push(COLORCATS_360[i]/360);
}
console.log(COLORCATS)

/* hue help
#ff0040	    rgb(255, 0, 64)	    hsl(345, 100%, 50%)
#ff0000	    rgb(255, 0, 0)	    hsl(0, 100%, 50%)
#ff4000	    rgb(255, 64, 0)	    hsl(15, 100%, 50%)

#ff8000	    rgb(255, 128, 0)	  hsl(30, 100%, 50%)
#ffbf00	    rgb(255, 191, 0)	  hsl(45, 100%, 50%)
#ffff00	    rgb(255, 255, 0)	  hsl(60, 100%, 50%)
#bfff00	    rgb(191, 255, 0)	  hsl(75, 100%, 50%)

#80ff00	    rgb(128, 255, 0)	  hsl(90, 100%, 50%)
#40ff00	    rgb(64, 255, 0)	    hsl(105, 100%, 50%)
#00ff00	    rgb(0, 255, 0)	    hsl(120, 100%, 50%)
#00ff40	    rgb(0, 255, 64)	    hsl(135, 100%, 50%)
#00ff80	    rgb(0, 255, 128)	  hsl(150, 100%, 50%)

#00ffbf	    rgb(0, 255, 191)	  hsl(165, 100%, 50%)
#00ffff	    rgb(0, 255, 255)	  hsl(180, 100%, 50%)
#00bfff	    rgb(0, 191, 255)	  hsl(195, 100%, 50%)
#0080ff	    rgb(0, 128, 255)	  hsl(210, 100%, 50%)
#0040ff	    rgb(0, 64, 255)	    hsl(225, 100%, 50%)
#0000ff	    rgb(0, 0, 255)	    hsl(240, 100%, 50%)

#4000ff	    rgb(64, 0, 255)	    hsl(255, 100%, 50%)
#8000ff	    rgb(128, 0, 255)	  hsl(270, 100%, 50%)
#bf00ff	    rgb(191, 0, 255)	  hsl(285, 100%, 50%)

#ff00ff	    rgb(255, 0, 255)	  hsl(300, 100%, 50%)
#ff00bf	    rgb(255, 0, 191)	  hsl(315, 100%, 50%)
#ff0080	    rgb(255, 0, 128)	  hsl(330, 100%, 50%)
*/

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

    this.yourSlug = new Slug(this, slug_x, slug_y, slug_r, new Phaser.Display.Color().setFromHSV(0, 1, 1));
    let s1 = new Slug(this, slug_x-80, slug_y-5, 100);
    this.slugs = [this.yourSlug, s1];
    
    let poison = [ ];

    for(var i = 0; i < 10; i++) {
      var c =  new Phaser.Display.Color().random().saturate(75);
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
          }
        })
      })
    }); 

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
  processCommand(input) {
    let cmd = []
    cmd = input.trim().split(/\s+/);
    let output = `${wrapCmd(cmd.join(' '))}: `

    if(cmd.length < 1 || cmd[0] == '') { return; }
    
    let cmd0 = cmd[0];

    switch (cmd0) {
      case 'if':
        let exception_if = `uh oh, an if rule needs to be of the form ${wrapCmd('if (X) {Y}')}!`;
        if(cmd.length < 3 || cmd[1] == '' || cmd[1][0] != '(' || cmd[2] == '') { 
          addToOutput(exception_if);
          return;
        }
        let condition = parseEncased('()', cmd);
        console.log(condition);
        let action = parseEncased('{}', cmd);
        console.log(action)

        switch (condition) {
          case '':
            break;
        
          default:
            break;
        }
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
  
    // SHOW THE SKELETONS OF THE SLUGS
    // TO ENSURE CIRCULAR MASKS ON THE TEXTURE FILES, IF PERFORAMCE HOG JUST CUT OUT THE TEXTURES BY HAND
    this.events.on('postupdate', function() {
      crcl.copyPosition(rt)
    }, this);

    return [o, crcl];
  }

  sameColorClass(color1, color2) {
    let cat1=-1, cat2 = -1;
    let i = 0;
    for(i = 0; i < COLORCATS.length; i++) {
      if(color1.h - COLORCATS[i] >= 0) {
        cat1 = i % (COLORCATS.length-1);
      } 
      if(color2.h - COLORCATS[i] >= 0) {
        cat2 = i % (COLORCATS.length-1);
      }
    }
    console.log('color.h:', color1.h, color2.h)
    console.log('cat:', COLORCATS_HR[cat1], COLORCATS_HR[cat2])
    if(cat1 == cat2) {
      return true;
    }
    else {
      return false;
    }
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

class Slug extends Phaser.GameObjects.GameObject {
  constructor(scene=Scene2, x=0, y=0, radius=20, color=new Phaser.Display.Color().random().saturate(75)) {
    super(scene, x, y);
    this.color = color;
    let headColor = this.color.clone().lighten((Math.min(0.2+Math.random(), 0.8))*50);
    let tailColor = this.color.clone().lighten((Math.min(0.1+Math.random(), 0.8))*30);

    this.head   = this.scene.addGameCircle(x, y, radius/1.5, headColor.color);
    let v = this.scene.addGameCircleTextured(x-radius+radius/1.5, y, radius, this.color.color);
    this.body = v[0]; this.bodymask   = v[1];
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