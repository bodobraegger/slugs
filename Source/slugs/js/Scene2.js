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

let SIZES = ['smaller', 'bigger']

let RULES = [ ];

let foodIndicesValid = []


let massMultiplierConstant = 2.2860618138362114;
let ifExample = 'if food is red then eat';

class Scene2 extends Phaser.Scene {
  constructor() {
    super("playGame")
  }

  create() {
    // this.matter.world.setBounds();
    this.matter.add.mouseSpring();
    // this.matter.enableAttractorPlugin();  
    // this.cursors = this.input.keyboard.createCursorKeys()
    
    
    let circle = this.add.circle(1, 1, 10, 0xFFF000);
    let arc = this.add.arc(100, 100, 50, 1, 180, false, 0xFFF000)
    let rectangle = this.matter.add.gameObject(this.add.rectangle(400, 200, 20, 10, 0x9966ff), this.matter.add.rectangle(400, 200, 20, 10))
    
    let length = 20
    
    let antenna_vertices = `0 0 0 ${2*length} ${2*length} ${1.5*length} ${2*length} ${0.5*length}`;
    // let antenna_vertices = [0,0, 0,2*length, 2*length,1.5*length, 2*length,.5*length]
    
    let polygon = this.matter.add.gameObject(this.add.polygon(200, 400, antenna_vertices, 0xFF22FF),  { shape: { type: 'fromVerts', verts: antenna_vertices, flagInternal: true } });
    // polygon = this.matter.add.gameObject(polygon, m_polygon);
    // polygon.setScale(0.2, 0.2);

    // let svg = this.add.image(250, 400, 'antennae').setScale(0.05);
    
    let group = this.add.group([circle, arc, rectangle, polygon]);
    group.setAlpha(0.5)
    
    let matterArc = this.matter.add.trapezoid(1, 1, 10, 20, 0.5);
    
    let slug_r = 20;
    let slug_x = getCanvasWidth()/2;
    let slug_y = getCanvasHeight()/2;
    
    
    let red = new Phaser.Display.Color().setFromHSV(0, 1, 1);
    this.yourSlug = new Slug(this, slug_x, slug_y, slug_r, red);
    let s1 = new Slug(this, slug_x-280, slug_y-5, 10);
    this.cameras.main.startFollow(this.yourSlug.torso, true, 0.008, 0.008);
    this.stage = 1;
    this.slugs = [this.yourSlug, s1];
    
    this.food = [ 
      this.addGameSpriteCircle(0, 0, 10, red.color, 'flower'),
      this.addGameSpriteCircle(getCanvasWidth(), 0, 15, red.color, 'flower'),
      this.addGameSpriteCircle(getCanvasWidth(), getCanvasHeight(), 20, red.color, 'flower'),
      this.addGameSpriteCircle(0, getCanvasHeight(), 25, red.color, 'circle_spiky'),
    ];
    
    for(var i = 0; i < 5; i++) {
      let rand = (Math.random()+0.2)*10
      let c =  new Phaser.Display.Color().random().saturate(100);
      
      this.food.push(this.addGameSpriteCircle(20+c.color%(rand*10), c.color%(rand*10), 5*rand, c.color, 'flower'));
      
      // let s = new Slug(this, slug_x+i*10*rand, slug_y+i*10*rand, (slug_r+20)*rand/10)
      // this.slugs.push(s);
    }
    foodIndicesValid = [...this.food.keys()]
    
    
    
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
        f.setOnCollideWith(s.heady, pair => {
          if(f.targeted) {
            if(f.radius <= s.heady.radius*s.heady.scaleX) {
              if(sameColorClass(f.color, s.color)) {
                if(s.alpha < 1) {
                  s.setAlpha(1);
                } else {
                  s.setScale(0.3+s.scaleX);
                }
              } else {
                s.setAlpha(0.5);
              }
              f.targeted = false;
              f.destroy();
              foodIndicesValid.splice(foodIndicesValid.indexOf(f_index), 1);
              s.eating = false;
              // this.food.splice(f_index);
            } else {
              logOutput(`the being can't eat anything bigger than its heady :0`)
              s.eating = false;
            }
            f.targeted = false;
          }
          
        })
      })
    }); 
    console.log(foodIndicesValid)
    let controlConfig = {
      camera: this.cameras.main,
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      // zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS),
      // zoomOut: this.input.mouse.onMouseWheel() ,
      acceleration: 0.03,
      drag: 0.0003,
      maxSpeed: 0.8
  };
    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    this.input.keyboard.preventDefault = false;
  }


  update(time, delta) {
    let constraints = [ ]
    this.slugs.forEach(e => {
      // SHOW THE SKELETONS OF THE SLUGS
      constraints = constraints.concat(e.jointsBody);
    })
    this.renderConstraint(constraints, 0xF9F6EE, 1, 1, 1, 0xF9F6EE, 1);

    if(this.yourSlug.scale > this.stage+1) {
      this.stage++;
      this.cameras.main.zoomTo(1/this.stage, 2000, 'Sine.easeInOut');
    }
    this.controls.update(delta)
    
    let vecTorsoHeady = velocityToTarget(this.yourSlug.torso, this.yourSlug.heady);
    if(Phaser.Math.Angle.ShortestBetween(Phaser.Math.RadToDeg(vecTorsoHeady.angle()), this.yourSlug.heady.angle) > 40)
    this.yourSlug.heady.setAngle(Phaser.Math.RadToDeg(vecTorsoHeady.angle()))
    /*
    if(this.follow = true) {
      this.cameras.main.scrollX = this.yourSlug.torso.x - document.getElementById("phaser_container").clientWidth/2;
      this.cameras.main.scrollY = this.yourSlug.torso.y - document.getElementById("phaser_container").clientHeight/2;
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

    // this.load.svg('antennae', 'assets/antennae-dotgrid.svg')
}
  processCommand(input = []) {
    let cmd = input;
    let output = `${wrapCmd(cmd.join(' '))}: `

    if(cmd.length < 1 || cmd[0] == '') { return; }

    // logInput(output);
    
    let cmd0 = cmd[0];
    
    switch (cmd0) {
      case ifWord:
        let exception_if = `uh oh, an if rule needs to be of the form ${wrapCmd('if <i>condition</i> then <i>action</i>')}, for example: ${wrapCmd(ifExample)}!`;
        if(cmd.length < 6 || !cmd.at(-2) == thenWord || !wordsAction.includes(cmd.at(-1))) { 
          logOutput(exception_if);
          return;
        }
        let thenIndex = cmd.indexOf(thenWord); 
        let condition = cmd.slice(1, thenIndex);
        let action = cmd.slice(thenIndex+1);
        // console.log(condition);
        // console.log(action);
        let ruleString = cmd.join(' ');
        if(RULES.includes(ruleString)) {
          output += `your being already learned that rule :)`
        }
        else {
          RULES.push(ruleString); 
          output += `your being learned the rule you gave it!`
        }
        logInput(output);
        return;
      case 'abracadabra':
        this.yourSlug.moveRandomly();
        this.yourSlug.joints.forEach(e=>{
          this.matter.world.removeConstraint(e);
        }); 
        output = `oh no! that was a bad magic trick.`
        break;
      case 'move':
        this.yourSlug.moveRandomly();
        output = `moving your being around :).`
        break;
      case 'eat':
        output += `you tell your being to eat.`
        logInput(output)
        this.yourSlug.eat();
        return;
        
      case stopWord:
        this.yourSlug.stop();
        output = `your being stops trying to complete the last action :)`
        break;

      case showWord:
        output += `you ask your being to tell you about itself`
        logInput(output);
        output = `it knows the following: <br>`
        let toShow = wordsToShow;  
        if(cmd.length > 1) {
          toShow = cmd.slice(1);
        }
        toShow.forEach((e, i) => {
          if(wordsToShow.includes(e)) {
            if(e=='rules') {
              if(RULES.length) {
                logOutput(`it knows the following rules: <br>`)
                output = '';
                RULES.forEach( (e, i) => {
                  output += `• ${e} <br>`;
                })
                logOutput(output)
              } else {
                logOutput(`your being does not know any rules yet. try giving it one by typing ${wrapCmd(ifExample)}!<br>`);
              }
            }
            if(e=='color') {
              logOutput(`your being tells you its color is ${COLORCATS_HR[getColorClass(this.yourSlug.color)]}`); 
            } 
          } else {
            logError(`${wrapCmd(cmd0)}: is not something your being could know!.<br>`);
          }
        })
        return;
      
      default:
        logError(`${wrapCmd(cmd0)}: is not a known command.<br> 
        try a different one, or try typing ${wrapCmd('help')}!.
        `); // new Phaser.Display.Color().random().rgba
        return;
      }
      logOutput(output)
  }

  addGameCircle(x, y, radius, color) {
    let circle = this.add.circle(x, y, radius, color);
    let matterCircle = this.matter.add.circle(x, y, radius);
    let o = this.matter.add.gameObject(
           circle,
      matterCircle
    )
    o.radius = radius;
    o.color = Phaser.Display.Color.IntegerToColor(color);
    return o
  }
  addGameSpriteCircle(x, y, radius, color = new Phaser.Display.Color().random().saturate(75).color, source = 'circle') {
    let img = new Phaser.GameObjects.Sprite(this, 0, 0, source);
    img.displayWidth = radius*2;
    img.displayHeight = radius*2;
    img.setTint(color);

    let rt = this.add.renderTexture(x, y, radius*2, radius*2);
    rt.draw(img, radius, radius);

    let matterCircle = this.matter.add.circle(x, y, radius);
    let o = this.matter.add.gameObject(
           rt,
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
  
    // TO ENSURE CIRCULAR MASKS ON THE TEXTURE FILES, IF PERFORMANCE HOG JUST CUT OUT THE TEXTURES BY HAND
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
    let headyColor = this.color.clone().lighten((Math.min(0.2+Math.random(), 0.8))*50);
    let tailColor = this.color.clone().lighten((Math.min(0.1+Math.random(), 0.8))*30);

    let headyRadius = radius/1.5
    let tail0Radius = radius/1.3
    let tail1Radius = radius/2

    this.heady   = this.scene.addGameCircle(x, y, headyRadius, headyColor.color);
    this.torso   = this.scene.addGameCircleTextured(x-radius-headyRadius, y, radius, this.color.color);
    this.tail0 = this.scene.addGameCircle(x-radius-headyRadius-tail0Radius, y, tail0Radius, tailColor.color);
    this.tail1 = this.scene.addGameCircle(x-radius-headyRadius-tail0Radius-tail1Radius, y, tail1Radius, tailColor.color);


    this.headyjoint  = this.scene.matter.add.joint(
      this.heady, this.torso, 
      2+(this.heady.radius+this.torso.radius)/2, 1, 
      {
        pointA: {x: -this.heady.radius/2, y: 0}, 
        pointB: {x: this.torso.radius/2, y: 0} }
    ); // , {pointA: {x: this.torso.radius/2, y: 0}}

    this.torsojoint  = this.scene.matter.add.joint(
      this.torso, this.tail0, 
      2+(this.torso.radius+this.tail0.radius)/2, 1,
      { pointA: {x: -this.torso.radius/2, y: 0}, 
        pointB: {x: this.tail0.radius/2, y: 0} }
    );
    this.tailjoint  = this.scene.matter.add.joint(
      this.tail0, this.tail1, 
      2+(this.tail0.radius+this.tail1.radius)/2, 1,
      { pointA: {x: -this.tail0.radius/2, y: 0}, 
        pointB: {x: this.tail1.radius/2, y: 0} }
    );
    this.headyjoint.angularStiffness = 0.2;

    this.jointsBody = [
      this.headyjoint,
      this.torsojoint,
      this.tailjoint
    ]
    this.joints = [...this.jointsBody]

    
    let antennaeColor = this.heady.fillColor; 
    let antennaLength = this.heady.radius;
    let a1 = this.scene.matter.add.gameObject(
      this.scene.add.rectangle(x-this.heady.radius*2, y, antennaLength, antennaLength/4, antennaeColor),
      this.scene.matter.add.rectangle(x-this.heady.radius*2, y, antennaLength, antennaLength/4)
      )
      let a2 = this.scene.matter.add.gameObject(
        this.scene.add.rectangle(x-this.heady.radius*2, y, antennaLength, antennaLength/4, antennaeColor),
        this.scene.matter.add.rectangle(x-this.heady.radius*2, y, antennaLength, antennaLength/4)
        )
      /*
        this.antennaeJoints = [
      // this.scene.matter.add.joint(a1, a2, antennaLength/2, 0.5, {pointA: {x: antennaLength/2, y: 0}, pointB: {x: antennaLength/2, y: 0}}),
      this.scene.matter.add.joint(this.heady, a1, 0, 0.5, {damping:0.05,pointA: {x: this.heady.radius, y: -this.heady.radius/4}, pointB: {x: antennaLength/2, y: 0}}),
      this.scene.matter.add.joint(this.heady, a2, 0, 0.5, {damping:0.05,pointA: {x: this.heady.radius, y: this.heady.radius/4}, pointB: {x: antennaLength/2, y: 0}}),
      // this.scene.matter.add.joint(a1, a2, 4+antennaLength, 0.5, {damping:0.05,pointA: {x: antennaLength/2, y: 0}, pointB: {x: -antennaLength/2, y: 0}}),
      
      this.scene.matter.add.joint(a1, a2, 4+antennaLength*1.5, 0.5, {damping:0.05,pointA: {x: antennaLength/2, y: 0}, pointB: {x: -antennaLength/2, y: 0}}),
      // this.scene.matter.add.joint(a2, a1, 4+antennaLength*1.5, 0.5, {damping:0.05,pointA: {x: antennaLength/2, y: 0}, pointB: {x: -antennaLength/2, y: 0}}),
      
    ]
    this.antennaeJoints.forEach(e=> {
      this.joints.push(e)
     });
     let antennae = [a1, a2]
     antennae.forEach(e => {
       e.setCollisionCategory(null);
     });
  
     this.antennae = this.scene.add.group(antennae)
     this.a1 = a1;
     this.a2 = a2;
   */
    

    this.joints.forEach(e => {
      e.originalLength = e.length;
    })



    this.bodyparts = [this.heady, this.torso, this.tail0, this.tail1]; //this.a1, this.a2, 
    this.bodyparts.forEach((e, i) => {
      // e.setCollisionGroup(i);
      // e.setCollidesWith(0);
      // this.add(e);
      e.setBounce(0.0)
    })
    this.list = this.bodyparts // + this.joints;
    this.alpha = 1;
    this.tint = color.color;
    this.setScale(1);
    this.body = this.torso.body;
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
    this.scale = (this.scaleX+this.scaleY) / 2;
    this.list.forEach(element => {
      element.setScale(sX, sY);
      element.scale = (element.scaleX+element.scaleY) / 2;
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
      j.length = 2+j.originalLength*(1+diff*Math.PI/2);
      // j.length = Math.max(2+(j.bodyA.circleRadius+j.bodyB.circleRadius)/2, j.originalLength*(1+diff*Math.PI/2))
    }

  }

  getMass() {
    let m = 0;
    this.list.forEach(e => {
      m += e.body.mass;
    })
    return m;

    // radius-mass-area
    // 20 2.8833982308888886 2872.873913134808
    // 40 11.727165065555555 11491.495652539232
    // 80 46.94205278022222 45965.98261015693

    // A = Math.PI * (this.radius*this.scaleX)**2
    // mass multiplier constant: 2.2860618138362114
    // M = Math.PI * (this.radius*this.scaleX)**2 * 2.2860618138362114
  }

  getArea() {
    let s = 0;
    this.list.forEach(e => {
      // s += Phaser.Geom.Circle.Area(e) // Math.PI * circle.radius * circle.radius
      console.log(e.type, e.radius, e.scaleX)
      s += Math.PI * (e.radius*(e.scaleX))**2
    })
    return s;
  }

  moveRandomly() {
    this.scene.matter.applyForce(this.heady, {x: getRandomInclusive(-0.2, 0.2), y: getRandomInclusive(-0.2, 0.2)})
  }

  eat(foodType='any') {
    this.eating = true;
    if(RULES.length) {
      logOutput(`first, the being thinks of the rules you gave it.`)
    }
    
    let rulesFood = [];
    
    this.foodMatching = [ ];
    
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
      logOutput(`it remembers the following food rules:`)
      let foodIndicesSelected = foodIndicesValid;
      
      for(let i = 0; i < rulesFood.length; i++) {
        let foodIndicesCurrentlySelected = [ ];
        let r = rulesFood[i]; 
        let booleanExpr = r.booleanExpr;
        let booleanString = booleanExpr.join(' '); // .splice(1, 0, '(').push(')')
        logOutput(`${booleanString.replaceAll("'", "")} ${i<rulesFood.length-1 ? 'and' : ''}`)
        booleanString = booleanString.replaceAll(equalWord, '==').replaceAll(andWord, '&&').replaceAll(` ${orWord}`, ` ||`);


        for(let i = 0; i < foodIndicesSelected.length; i++) {
          let f = this.scene.food[ foodIndicesSelected[i] ];
          // VARIABLE NAME NEEDS TO BE SAME AS INPUT!!
          let food = '';
          if(r.ifColor) {
            food = COLORCATS_HR[getColorClass(f.color)];
          }
          if(r.ifSize) {
            food = (this.heady.radius*this.heady.scaleX < f.radius ? 'bigger':'smaller' )
          }
          if(r.ifTexture) {
            food = f.textureType;
          }
          console.log(booleanString, food);
          let evaluation = eval(booleanString);
          console.log(evaluation);
          if(evaluation && !r.avoid) {
            foodIndicesCurrentlySelected.push(foodIndicesSelected[i]);
          }
        }
        console.log(foodIndicesCurrentlySelected);
        foodIndicesSelected = foodIndicesCurrentlySelected;
      }
      for(let i = 0; i < foodIndicesSelected.length; i++) {
        this.foodMatching.push(this.scene.food[foodIndicesSelected[i]])
      }
    }
    else {
      logOutput('none of the rules tell your being what to eat, so it will try to eat anything!')
      for(let i=0;i<foodIndicesValid.length;i++) {
        this.foodMatching.push(this.scene.food[ foodIndicesValid[i] ]);
      }
    }
    if(!this.foodMatching.length) {
      logOutput(`there is no foody item which matches your beings rules close enough - try adapting your rules or moving your being closer :)`)
      this.eating = false;
      return
    }
    // having found our food stuff, move to it until you're close!
    this.closestMatch = findClosest(this.heady, this.foodMatching);
    this.closestMatch.targeted = true;
    let rotationDirection = 0;
    /*
      let timedEvent = new Object();
      const repeat = () => {
        if(!this.closestMatch.active) {
          timedEvent.remove();
          return
        }
        closestMatchNew = findClosest(this.heady, this.foodMatching);

        let target = velocityToTarget(this.heady, this.closestMatch, 5);
        let projectedVelocity = target.clone();

        let angleSlugTarget = Phaser.Math.Angle.ShortestBetween(this.heady.angle, target.angle());
        console.log(angleSlugTarget)
        // console.log(this.getMass(), this.getArea())

        let speedMod = 5

        if(! rotationDirection) {
          if(angleSlugTarget > 0 && angleSlugTarget <= 150) {
            rotationDirection = -1;
            console.log('rotating left')
          } else if(angleSlugTarget < 0 && angleSlugTarget >= -150) {
            rotationDirection = 1;
            console.log('rotating right')
          }
        }
        /*
        if(rotationDirection == -1 && (angleSlugTarget > 0 && angleSlugTarget <= 150)) {
           this.heady.thrustLeft(Math.sqrt(this.heady.body.mass)*0.008)
          this.tail0.thrustRight(Math.sqrt(this.tail0.body.mass)*0.008)
          timedEvent.repeatCount++;
        }
        else if(rotationDirection == 1 && (angleSlugTarget < 0 && angleSlugTarget >= -150)) {
          this.heady.thrustRight(Math.sqrt(this.heady.body.mass)*0.008)
           this.tail0.thrustLeft(Math.sqrt(this.tail0.body.mass)*0.008)
          timedEvent.repeatCount++;
        }
        else {
          console.log('looking at it')
          this.heady.setVelocity(projectedVelocity.x, projectedVelocity.y);
          this.torso.setVelocity(projectedVelocity.x, projectedVelocity.y);
        }


        if(angleSlugTarget > 0 && angleSlugTarget <= 150) {
          this.heady.setVelocity(velocityLeft(this.heady, speedMod).x, velocityLeft(this.heady, speedMod).y);
          this.tail0.setVelocity(velocityRight(this.tail0, speedMod).x, velocityRight(this.heady, speedMod).y);
          timedEvent.repeatCount++;
        }
        else if(angleSlugTarget < 0 && angleSlugTarget >= -150) {
          this.heady.setVelocity(velocityRight(this.heady, speedMod).x, velocityRight(this.heady, speedMod).y);
          this.tail0.setVelocity(velocityLeft(this.tail0, speedMod).x, velocityLeft(this.tail0, speedMod).y);
          timedEvent.repeatCount++;
        }
        else {
          this.heady.setVelocity(projectedVelocity.x, projectedVelocity.y);
        }
        this.tail1.setVelocity(velocityFacing(this.tail1, speedMod).x, velocityFacing(this.tail1, 1).y)
        this.tail0.setVelocity(velocityFacing(this.tail0, speedMod).x, velocityFacing(this.tail0, 1).y)
        this.torso.setVelocity(velocityFacing(this.torso, speedMod).x, velocityFacing(this.torso, 1).y)
        this.heady.setVelocity(velocityFacing(this.heady, speedMod).x, velocityFacing(this.heady, 1).y)

        // this.heady.applyForce(this.heady, velocityFacing(this.heady, 30));

        if(Phaser.Math.Distance.Between(this.heady.x, this.heady.y, this.closestMatch.x, this.closestMatch.y) < this.heady.scaleX*this.heady.radius+this.closestMatch.radius ||  this.eating == false) {
          timedEvent.remove()
        }

        closestMatchNew = findClosest(this.heady, this.foodMatching);
        if(this.closestMatch != closestMatchNew) {
          this.closestMatch.targeted = false;
          this.closestMatch = closestMatchNew;
          this.closestMatch.targeted = true;
          rotationDirection = 0;
          this.chosenFood = this.closestMatch;
          console.log('target switched')
        }
        if(timedEvent.getRepeatCount() == 0) {
          this.closestMatch.targeted = false;
          logOutput(`your being couldn't reach the food it was looking for, maybe you could help it by moving it closer :)`)
          this.eating = false;
        }
      }
      timedEvent = this.scene.time.addEvent({
        delay: 500,
        startAt: 0,
        repeat: 1,
        callback: repeat,
      })
    */
      // console.log('outside update', foodIndicesValid, this.foodMatching, this.scene.food);
    let swimStates = [-20, 0, 20, 0];
    swimStates.forEach((e, i) => {swimStates[i] = Phaser.Math.DegToRad(e)})
    let waveIndex = 0;
    console.log(swimStates)
    this.timer = 0;
    this.scene.events.on('update', function(time, delta) {
      if(this.eating && this.foodMatching && this.heady.x && this.heady.y){
        //console.log('inside update', foodIndicesValid, this.foodMatching, this.scene.food);
        let closestMatchNew = findClosest(this.heady, this.foodMatching);
        // console.log(this.closestMatch)
        
        let target = velocityToTarget(this.heady, this.closestMatch);
        let distanceToFood = Phaser.Math.Distance.BetweenPoints(this.heady, this.closestMatch)

        let vecTorsoHeady = velocityToTarget(this.torso, this.heady)
        let angleSlugTarget = Phaser.Math.Angle.ShortestBetween(Phaser.Math.RadToDeg(vecTorsoHeady.angle()), Phaser.Math.RadToDeg(target.angle()));
        
        let speed = 4;
  
        let tail1Vec = velocityFacing(this.tail1, speed/2); 
        let tail0Vec = velocityFacing(this.tail0, speed/2); 
        let torsoVec = velocityFacing(this.torso, speed/2); 
        let headyVec = velocityFacing(this.heady, speed/2); 
        // this.tail1.setVelocity(tail1Vec.x, tail1Vec.y)
        // this.tail0.setVelocity(velocityFacing(this.tail0, speed).x, velocityFacing(this.tail0, 1).y)
        // this.torso.setVelocity(velocityFacing(this.torso, speed).x, velocityFacing(this.torso, 1).y)
        // this.heady.setVelocity(headyVec.x, headyVec.y)

        
        if(! rotationDirection) {
          if(angleSlugTarget > 0 && angleSlugTarget > 50) {
            rotationDirection = -1;
            console.log('rotating left')
          } else if(angleSlugTarget < 0 && angleSlugTarget < -50) {
            rotationDirection = 1;
            console.log('rotating right')
          }
        }

        let correctionAngle = Phaser.Math.DegToRad(40);
        // console.log(Math.round(angleSlugTarget), rotationDirection)
        
        if((angleSlugTarget > 0 && angleSlugTarget < 70)||(angleSlugTarget < 0 && angleSlugTarget > -70)){
          headyVec.add(target);
          this.torso.setVelocity(headyVec.x, headyVec.y);
          this.heady.setVelocity(headyVec.x, headyVec.y);
          // this.heady.applyForce(this.heady, this.heady, headyVec);
          this.heady.setAngle(Phaser.Math.RadToDeg(headyVec.angle()))
          
          
          if(distanceToFood > 50) {
            // this.tail1.setVelocity(headyVec.x, headyVec.y);
            tail0Vec.rotate(swimStates[waveIndex]); // headyVec.mirror(vecTorsoHeady);
            this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
          }
        }
        else if(rotationDirection == -1 && (angleSlugTarget > 50 || angleSlugTarget < -50)) {
          console.log('counter clockwise')
          
          let torsoVec = headyVec.clone().setLength(0.25*speed);
          this.torso.setVelocity(torsoVec.x, torsoVec.y);
          headyVec.setAngle(this.heady.rotation - correctionAngle)
          tail0Vec.setAngle(this.tail0.rotation + correctionAngle);
          // headyVec.add(target);
          this.heady.setVelocity(headyVec.x, headyVec.y);
          this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
        }
        else if(rotationDirection == 1 && (angleSlugTarget > 50 || angleSlugTarget < -50)) {
          console.log('clockwise (right)')
          
          let torsoVec = headyVec.clone().setLength(0.25*speed);
          this.torso.setVelocity(torsoVec.x, torsoVec.y);
          headyVec.setAngle(this.heady.rotation + correctionAngle)
          tail0Vec.setAngle(this.tail0.rotation - correctionAngle);
          // headyVec.add(target);
          this.heady.setVelocity(headyVec.x, headyVec.y);
          this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
        }
        
        
        if(this.closestMatch != closestMatchNew) {
          let closer = Phaser.Math.Distance.BetweenPoints(this.heady, closestMatchNew) - distanceToFood;
          if( closer > 20){
            
            console.log(closestMatchNew)
            closestMatchNew.targeted = true;
            this.closestMatch.targeted = false;
            this.closestMatch = closestMatchNew;
            rotationDirection = 0;
            console.log('target switched')
            this.chosenFood = this.closestMatch;
          } 
        }
        this.timer += delta;
        while(this.timer > 600) {
          waveIndex = (waveIndex+1) % swimStates.length;
          this.timer -= 600;
        }
        this.foodMatching.forEach((e, i) => {
          if(!e.active) {
            this.foodMatching.splice(i, 1)
          }
        })
      }
      else {
        rotationDirection = 0
      }
    }, this);
  }

  stop() {
    this.eating = false;
    if(this.chosenFood) {
      this.chosenFood.targeted = false;
      this.chosenFood = null;
    }

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
  // console.log(A, B)
  // console.log(A.x, A.y);
  B.forEach(b=> {
    // console.log(b.x, b.y)
    // distance squared is faster
    currentDistance = Phaser.Math.Distance.Squared(A.x, A.y, b.x, b.y);
    // console.log(A.x, A.y, b.x, b.y)
    if(currentDistance < distance) {
      distance = currentDistance;
      closest = b;
    }
    // console.log(distance)
  })
  return closest;
}
