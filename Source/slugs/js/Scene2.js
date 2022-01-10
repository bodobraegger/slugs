/* 
** GLOBALS **
*/
// 6 categories of hues, hue of 0 and 1 both correspond to red, so cats need to be shifted by half a value
let COLORCATS_HR  = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink','red']
let COLORCATS_360 = [0, 5, 45, 75, 165, 240, 285, 350]
let COLORCATS     = [ 0 ];
let COLORCATS_DICT = {}

let ATTRIBUTES = ['color', 'texture', 'shape']

let EDITABLE = ['rules', 'routines']
let EDITABLE_withSingular = ['rule', 'routine'].concat(EDITABLE)

for(let i = 0; i < COLORCATS_360.length; i++) {
  COLORCATS[i] = COLORCATS_360[i]/360;
  COLORCATS_DICT[COLORCATS_HR[i]] = COLORCATS[i];
}
console.log(COLORCATS_DICT)

let ENTITY_TYPES = ['fruit', 'other_creature']

let TEXTURES = ['smooth', 'spiky']

let SIZES = ['smaller', 'bigger']

let SHAPES = ['round', 'edgy']

let RULES = [ ];
let ROUTINES = [ ];

let FOOD = {}
let FOOD_MATCHING;
let FOOD_MINIMUM = 3;

let PLANTS;
let ENEMIES;

let playersBeing = new Object

let massMultiplierConstant = 2.2860618138362114;
const { Vector2, Angle, Distance, DegToRad, RadToDeg, Between, FloatBetween } = Phaser.Math;
const { Color } = Phaser.Display;
const { GameObjects } = Phaser; 
const ifExample = 'if fruit is red then eat';
const loopExample = 'while fruit on plant eat';
const editExample = `replace rule 1 with ${ifExample}`;
const deleteExample = 'forget rule 1'

let timerEvents = [ ]

let SCENE;

let NARRATION = new Narration();

const flowerTextures = ['flower_1', 'flower_2']
const spikyTextures = ['circle_spiky_1','circle_spiky_2', 'circle_spiky_3']

class Scene2 extends Phaser.Scene {
  constructor() {
    super("playGame")
  }
  preload() {
    this.load.setBaseURL(document.getElementById('phaser_container').getAttribute('data-assets-baseURL')); 
    this.load.image('circle', 'assets/circle.png');
    this.load.image('circle_spiky_1', 'assets/circle_spiky_1.png');
    this.load.image('circle_spiky_2', 'assets/circle_spiky_2.png');
    this.load.image('circle_spiky_3', 'assets/circle_spiky_3.png');
    this.load.image('flower_1', 'assets/flower_1.png');
    this.load.image('flower_2', 'assets/flower_2.png');
    
    this.load.image('square_rounded', 'assets/square_rounded.png');
    this.load.image('circle_leopard', 'assets/circle_leopard.png');
    this.load.spritesheet('jelly', 'assets/jellyfish_spritesheet.png', {frameWidth: 32, frameHeight: 32})

    // this.load.svg('antennae', 'assets/antennae-dotgrid.svg')
  }
  create() {
    SCENE = this;
    this.graphics = this.add.graphics();
    // this.matter.world.setBounds();
    this.matter.add.mouseSpring();
    this.anims.create({key: 'jelly_idle', frames: this.anims.generateFrameNumbers('jelly', {start:0, end:4}), frameRate:5, repeat: -1})
    this.anims.create({key: 'jelly_jump', frames: this.anims.generateFrameNumbers('jelly', {start:7, end:11}), frameRate:5, repeat: -1})
    this.anims.create({key: 'jelly_move', frames: this.anims.generateFrameNumbers('jelly', {start:14, end:18}), frameRate:5, repeat: -1})
    this.anims.create({key: 'jelly_expl', frames: this.anims.generateFrameNumbers('jelly', {start:21, end:27}), frameRate:5, repeat: -1})
    // this.matter.enableAttractorPlugin();  
    // this.cursors = this.input.keyboard.createCursorKeys()
    /*
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
    */
   
   
    this.companion = this.add.sprite(300, 300, 'jelly').setScale(10);

   
    this.companion = this.matter.add.gameObject(this.companion, this.matter.add.rectangle(0, 0, this.companion.displayWidth/3, this.companion.displayHeight/2))
    
    let slug_r = 20;
    let slug_x = getCanvasWidth()/2;
    let slug_y = getCanvasHeight()/2;
    
    let playersBeingColor = getRandomColorInCat([ COLORCATS_DICT['purple'], COLORCATS_DICT['blue'], COLORCATS_DICT['orange'] ]);
    changeStylesheetRule(document.styleSheets[0], '.beingscolor', `background-color`, `#${playersBeingColor.color.toString(16)}`)
    changeStylesheetRule(document.styleSheets[0], `.${COLORCATS_HR[getColorCategory(playersBeingColor)]}`, `color`, `#${playersBeingColor.color.toString(16)}`)
    this.pb = new Slug(this, slug_x, slug_y, slug_r, playersBeingColor);
    playersBeing = this.pb;
    this.rulesLength = 0;
    let pbColorCat = getRandomColorInCat(playersBeingColor)

    // let s1 = new Slug(this, slug_x-280, slug_y-5, 10);
    this.cameras.main.startFollow(this.pb.torso, true, 0.08, 0.08);
    this.stage = 1;
    this.slugs = [this.pb];
   
    this.enemySpawned = false;

    let foodsInitial = [ 
      this.addFruit(0, 0, 10, pbColorCat, 'flower'),
      this.addFruit(getCanvasWidth(), 0, 15, pbColorCat, 'flower'),
      this.addFruit(getCanvasWidth(), getCanvasHeight(), 20, pbColorCat, 'flower'),
      this.addFruit(getCanvasWidth(), getCanvasHeight()+5, 20, pbColorCat, 'flower'),
      this.addFruit(getCanvasWidth()+5, getCanvasHeight()+5, 20, pbColorCat, 'flower'),
      this.addFruit(0, getCanvasHeight(), 25, pbColorCat, 'circle_spiky'),
    ];
    
    FOOD = new Phaser.GameObjects.Group(this, foodsInitial);
    FOOD_MATCHING = new Phaser.GameObjects.Group(this);
    // FOOD.maxSize = 15;
    let planty = new Plant(this, 800, 40, getRandomColorInCat(4), 400, 15, 5);
    PLANTS = new Phaser.GameObjects.Group(this, [planty])
    PLANTS.add(new Plant(this, 300, 300, getRandomColorInCat(5), 400, 24, 10, true))
    PLANTS.add(new Plant(this, getCanvasWidth(), 300, getRandomColorInCat(getColorCategory(playersBeingColor)), 300, 15, 5, false))
    PLANTS.add(new Plant(this, getCanvasWidth(), getCanvasHeight(), getRandomColorInCat(getColorCategory(playersBeingColor)), 600, 19, 20, true))
    
    let coordinates = [ ]
    
    PLANTS.getChildren().forEach(e=>{
      let x = (e.getChildren()[0].x+e.getChildren().at(-1).x)/2;
      let y = (e.getChildren()[0].y+e.getChildren().at(-1).y)/2;
      coordinates.push({x, y})
    })

    for(var i = 0; i < 25; i++) {
      let yesOrNo = Between(0, 3)
      let randFN = Between(3, 15) 
      let randFS = Between(15, 150)
      let randSize = Between(randFN*randFS+10, randFN*randFS+10)
      let tooClose = false;
      let distx, disty;
      do {
        distx = this.pb.x+(Math.random()<0.5 ? Between(-4000*this.pb.scale, -400*this.pb.scale):Between(400*this.pb.scale, 4000*this.pb.scale))
        disty = this.pb.y+(Math.random()<0.5 ? Between(-4000*this.pb.scale, -400*this.pb.scale):Between(400*this.pb.scale, 4000*this.pb.scale))
        if(coordinates.length) {
          coordinates.forEach(p=> {
            tooClose = Math.abs(p.x-distx)+Math.abs(p.y-disty) < Math.max(randSize*3, 4000) || Math.abs(p.x-distx) < Math.max(randSize, 1000) || Math.abs(p.y-disty) < Math.max(randSize, 1000);
            // console.log(Math.abs(p.x-distx)+Math.abs(p.y-disty),randSize*3)
            if(tooClose) {
              return tooClose;
            }
          })
        }
      } while(tooClose);
      
      coordinates.push({x: distx, y: disty});

      let c = getRandomColorInCat();
      
      // FOOD.add(this.addFruit(20+c.color%(rand*10), c.color%(rand*10), 5*rand, c, 'flower'));
      let plant; 
      if(yesOrNo) {
        plant = new Plant(this, distx, disty, c, randSize, randFS, randFN, true)
      } else {
        plant = new Plant(this, distx, disty, c, randSize, randFS, Math.floor(randFN/3))
      }
      PLANTS.add(plant)
      // let s = new Slug(this, slug_x+i*10*rand, slug_y+i*10*rand, (slug_r+20)*rand/10)
      // this.slugs.push(s);
      this.activeFoodlength = FOOD.getMatching('active', true)
    }

    ENEMIES = new Phaser.GameObjects.Group(this, []);
    
    // RENDER TERMINAL ON TOP OF PHASER
    // const ph_terminal_container = this.add.dom(0.8*document.getElementById("phaser_container").clientWidth, 0.9*document.getElementById("phaser_container").clientHeight/2, terminal_container)
    // const terminal_input = document.getElementById('terminal_input');
    
    terminal_input.addEventListener('cmd', (e) => {
      // WE HAVE A HOOK INTO THE TERMINAL
      this.processCommand(e.detail.value);
    });

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

    // NARRATION
    NARRATION.intro();

  }


  update(time, delta) {
    this.graphics.clear()
    // console.log(constraints)
    let constraints = [ ]
    this.slugs.forEach(e => {
      // SHOW THE SKELETONS OF THE SLUGS
      constraints = constraints.concat(e.jointsBody);
    })
    this.renderConstraint(constraints, 0xF9F6EE, undefined, 2*this.pb.scale);
    constraints = [ ]
    PLANTS.getChildren().forEach(p => {
      let visible = p.getVisible();
      if( !visible.length && p.circle && p.width < this.pb.torso.displayWidth*1.5) {
        let f = this.addFruit(p.getFirstAlive().x, p.getFirstAlive().y, p.width/2, p.color, 'flower');
        console.log('replacing',p,'with',f)
        FOOD.add(f)
        p.destroy(true, true);
        return;
      }
      if(visible.length && (this.pb.scale <= 10 || (p.circle && (p.fruitsNumber < 16 || p.fruitsRadius > this.pb.heady.displayWidth/2-50))) ) {
        visible.forEach(v => {
          constraints = [... new Set(constraints.concat(v.joints))];
        })
      } else {
        // p.destroy();  
      }
    })
    this.renderConstraint(constraints, 0x006400, 0.8, 3, 1, 0x006400, 4 )
    
    if(this.pb.scale > this.stage+1) {
      this.stage++;
      this.cameras.main.zoomTo(1/this.stage, 2000, 'Sine.easeInOut');
    }
    if(this.stage == 4 && !this.enemySpawned) {
      this.pb.stop();
      this.enemySpawned = true;
      let x = this.pb.torso.x+this.pb.torso.scale*getCanvasWidth()/2;
      let y = this.pb.torso.y+this.pb.torso.scale*getCanvasHeight()/2
      this.enemy = new Snake(this, x, y, this.pb.torso.displayWidth, getRandomColorInCat(['red', 'yellow']).darken(25));
      this.enemy.name = 'enemy'
      ENEMIES.add(this.enemy);
      console.log(`spawned enemy at`, this.enemy.x, this.enemy.y, this.enemy);
      changeStylesheetRule(document.styleSheets[0], '.enemycolor', `background-color`, `#${this.enemy.color.color.toString(16)}`)
      NARRATION.hunted();
      this.enemy.eat();
    }
    this.controls.update(delta)
    let vecTorsoHeady = velocityToTarget(this.pb.torso, this.pb.heady);
    if(Angle.ShortestBetween(RadToDeg(vecTorsoHeady.angle()), this.pb.heady.angle) > 40)
    this.pb.heady.setAngle(RadToDeg(vecTorsoHeady.angle()))
    
    let healthyCount = 0;
    
    FOOD.getMatching('active', true).forEach(f => {
      if(sameColorCategory(f.color, f.color) && f.txtr == this.pb.txtr && f.shape == this.pb.shape && f.radius < this.pb.heady.displayWidth/2) {
        healthyCount++;
      }
      /*if(f.displayWidth*15 < this.pb.heady.displayWidth/2 && !f.group) {
          let fruit = this.addFruit(
            this.pb.x+(Math.random()<0.5 ? Between(-3000*this.pb.scale, -1000*this.pb.scale):Between(1000*this.pb.scale, 3000*this.pb.scale)), 
            this.pb.y+(Math.random()<0.5 ? Between(-3000*this.pb.scale, -1000*this.pb.scale):Between(1000*this.pb.scale, 3000*this.pb.scale)),
            this.pb.displayWidth/2-5,
            f.color,
            f.txtr  
          )
          console.log('replacing', f, 'with', fruit);
          FOOD.add(fruit)
          f.destroy();
      }*/
    })

    if(RULES.length != this.rulesLength || this.triggerFoodUpdate || this.activeFoodlength != FOOD.getMatching('active', true).length) {
      this.rulesLength = RULES.length;
      FOOD_MATCHING.clear();
      let foodSelected = FOOD.getMatching('active', true);
      let rulesFood = this.pb.rulesParsed.filter(e => e.action == 'eat')
      for(let i = 0; i < rulesFood.length; i++) {
        let foodCurrentlySelected = [ ];
        let r = rulesFood[i]; 
        console.log('adapting matching fruit! -> rule', r)
        let booleanExpr = r.booleanExpr;
        let booleanString = booleanExpr.join(' '); // .splice(1, 0, '(').push(')')
        booleanString = booleanString.replaceAll(equalWord, '==').replaceAll(andWord, '&&').replaceAll(` ${orWord}`, ` ||`);
        if(booleanString.includes('beings ')) {
          ATTRIBUTES.forEach( (e,i) => {
            if(booleanString.includes(`beings ${e}`)) {
              // console.log(booleanString, e)
              let replacement = playersBeing[e];
              if(replacement instanceof Phaser.Display.Color) {
                replacement = COLORCATS_HR[getColorCategory(replacement)];
              }
              booleanString = booleanString.replaceAll(`beings ${e}`, `'${replacement}'`)
            }
          })
        }

        for(let i = 0; i < foodSelected.length; i++) {
          let f = foodSelected[i];
          // VARIABLE NAME NEEDS TO BE SAME AS INPUT!!
          let fruit = '';
          if(r.ifColor) {
            fruit = COLORCATS_HR[getColorCategory(f.color)];
          }
          if(r.ifSize) {
            if(booleanString.includes('beings size')) {
              booleanString.replaceAll('beings size', `'beings size'`);
              fruit = (this.pb.heady.displayWidth > f.displayWidth - 5*this.pb.scale || this.pb.heady.displayWidth < f.displayWidth - 5*this.pb.scale ? "beings size":"not same size" );
            } else{
              fruit = (this.pb.heady.displayWidth < f.displayWidth ? 'bigger':'smaller' )
            }
          }
          if(r.ifTexture) {
            fruit = f.txtr;
          }
          // console.log(booleanString, 'fruit var:', fruit);
          let evaluation;
          try {
            evaluation = eval(booleanString);
            // console.log(booleanString, fruit, evaluation);
          } catch (error) {
            console.error(error);
          }
          if(evaluation) {
            foodCurrentlySelected.push(foodSelected[i]);
          }
        }
        // console.log(foodCurrentlySelected);
        foodSelected = foodCurrentlySelected;
      }
      // FOOD_MATCHING = foodSelected;
      FOOD_MATCHING.addMultiple(foodSelected.filter(e => (e.displayWidth > this.pb.heady.displayWidth/4 && e.displayWidth < this.pb.heady.displayWidth*3)));

      this.triggerFoodUpdate = false;
      this.activeFoodlength = FOOD.getMatching('active', true).length
    }   

    FOOD_MATCHING.getMatching('visible', true).forEach(f => {
      let headyToTarget = new Vector2(f).subtract(this.pb.heady);
      let len = headyToTarget.length();
      if(!(f==this.pb.chosenFood) && len < (this.pb.scale*100+f.displayWidth)*4) {
        let alpha =(this.pb.heady.displayWidth+f.displayWidth)*3/len;
        drawVec(headyToTarget, this.pb.heady, this.pb.color.color, Math.min(this.pb.heady.displayWidth/2.5, (this.pb.heady.displayWidth+f.displayWidth)*10/len), Math.min(alpha, 0.5))
      }
    })
    // console.log(healthyCount)
    if(healthyCount<FOOD_MINIMUM) {
      let x = this.pb.x+(Math.random()<0.5 ? Between(-1000*this.pb.scale, -500*this.pb.scale):Between(500*this.pb.scale, 1000*this.pb.scale)), 
      y = this.pb.y+(Math.random()<0.5 ? Between(-1000*this.pb.scale, -500*this.pb.scale):Between(500*this.pb.scale, 1000*this.pb.scale));
      let f = this.addFruit(
        x, y,
        this.pb.displayWidth/2-5,
        getRandomColorInCat(this.pb.color),
        'flower'  
      )
      FOOD.add(f)
      console.log('new fruit because not enough healthy! at', x, y, f)
    }
    // COMPANION
    // console.log(Math.max(Math.abs(this.companion.body.velocity.x), Math.abs(this.companion.body.velocity.y)))
    if(this.companion.visible) {
      if(Math.max(Math.abs(this.companion.body.velocity.x), Math.abs(this.companion.body.velocity.y)) < 1) {
        this.companion.play('jelly_idle', true)
      }
      else if(Math.max(Math.abs(this.companion.body.velocity.x), Math.abs(this.companion.body.velocity.y)) < 5) {
        this.companion.play('jelly_jump', true)
      }
      else {
        this.companion.play('jelly_move', true)
      }
      this.companion.setRotation(this.pb.torso.rotation+DegToRad(90));
      // this.companion.x = this.pb.torso.x+30*this.pb.scale;
      // this.companion.y = this.pb.torso.y+30*this.pb.scale;      
    }
  }
  processCommand(input = [], newSegment=true) {
    let cmd = input;
    let output = `${wrapCmd(cmd.join(' '))}: `

    if(cmd.length < 1 || cmd[0] == '') { return; }

    // logInput(output);
    
    // TODO: IMPLEMENT SOME SORT OF WAY TO RECOGNIZE CONNECTED OUTPUT BUBBLES FOR COLORING CURRENT OUTPUT
    // startOutput();
    if(newSegment) { startNewLogSegment(); }

    switch (cmd[0]) {
      case ifWord: {
        const ifError = `uh oh, an if rule needs to be of the form ${wrapCmd('if <i>condition</i> then <i>action</i>')}, for example: ${wrapCmd(ifExample)}!`
        if(cmd.length < 6 || !cmd.at(-2) == thenWord || !wordsAction.includes(cmd.at(-1)) || !(cmd.includes(ENTITY_TYPES[0])||cmd.includes(ENTITY_TYPES.at(-1))) ) { 
          logInput(output);
          logOutput(ifError);
          return;
        }
        let ruleString = cmd.join(' ');
        if(RULES.includes(ruleString)) {
          output += `your being already learned that rule :)`
        }
        else {
          this.pb.addRule(ruleString);
          
          output += `your being learned the rule you gave it!`
        }
        logInput(output);
        return;
      }
      case loopWord: {
        if(cmd.length < 5 || !wordsAction.includes(cmd.at(-1))) { 
          logOutput(`uh oh, a routine needs to be of the form ${wrapCmd(loopWord + ' <i>condition</i> <i>action</i>')}, for example: ${wrapCmd(loopExample)}!`);
          return;
        }
        let routineString = cmd.join(' ')
        if(ROUTINES.includes(routineString)) {
          output += `your being already knows that routine :)`
        }
        else {
          ROUTINES.push(routineString);
          output += `your being learned the new routine!`
        }
        if(cmd.includes('plant')) {
          this.pb.plantLoop = true;
        }
        logInput(output);
        return;
      }
      case 'abracadabra': {
        this.pb.moveRandomly();
        this.matter.world.removeConstraint(this.pb.joints, true);

        output = `oh no! that was a bad magic trick.`
        break;
      }
      case 'move': {
        this.pb.moveRandomly();
        output = `moving your being around :).`
        break;
      }
      case 'eat': {
        output += `you tell your being to eat.`
        logInput(output)
        this.pb.eat();
        return;
      }
      case stopWord: {
        this.pb.stop();
        output = `your being stops trying to complete the last action :)`
        break;
      }
      case showWord: {
        output += `you ask your being to tell you about itself`
        logInput(output);
        output = `it knows the following: <br>`
        let toShow = wordsToShow;  
        if(cmd.length > 1) {
          toShow = cmd.slice(1);
        }
        if(['rules', 'rule'].includes(toShow[0]) && toShow.length > 1) {
          if(toShow[1]-1 < RULES.length) {
            logOutput(`this is the rule number ${toShow[1]}.: ${RULES[toShow[1]-1]}.<br>`)
          } else {
            logError(`your being knows no rule number ${toShow[1]}<br>`);
            return;
          }
        } else if(['routines', 'routine'].includes(toShow[0]) && toShow.length > 1) {
          if(toShow[1]-1 < ROUTINES.length) {
            if(toShow[1]-1 < ROUTINES.length) {
              logOutput(`this is the routine number ${toShow[1]}.: ${ROUTINES[toShow[1]-1]}.<br>`)
            } else {
              logError(`your being knows no routine number ${toShow[1]}<br>`);
            }
            return;
          }
        }
        toShow.forEach((e, i) => {
          if(wordsToShow.includes(e)) {
            let RULESorROUTINES = []
            if(e=='rules') { RULESorROUTINES = RULES;
            } else if(e=='routines') { RULESorROUTINES = ROUTINES; }  
            if(EDITABLE.includes(e)){
              if(RULESorROUTINES.length) {
                logOutput(`it knows the following ${wrapCmd(e)}: <br>`)
                output = '';
                RULESorROUTINES.forEach( (e, i) => {
                  output += `${i+1}. ${wrapCmd(e)} <br>`; //•
                })
                logOutput(output)
              } else {
                logOutput(`your being does not know any ${wrapCmd(e)} yet. try giving it one by typing ${wrapCmd(ifExample)}!<br>`);
              }
            } else if(e=='color') {
              logOutput(`your being tells you its ${wrapCmd(e)} is ${wrapCmd(COLORCATS_HR[getColorCategory(this.pb.color)])}.`); 
            } else if(e=='texture') {
              logOutput(`your being says its ${wrapCmd(e)} feels ${wrapCmd(this.pb.txtr)}.`); 
            } else if(e=='shape') {
              logOutput(`because your being is made of circles, it thinks its ${wrapCmd(e)} is ${wrapCmd(this.pb.shape)}.`); 
            }
          } else {
            logError(`${wrapCmd(e)}: is not something your being could know!<br>`);
          }
        })
        return;
      }
      case deleteWord: {
        let ruleOrRoutine = (['rules', 'rule'].includes(cmd[1]) ? 'rule':'routine')
        let RULESorROUTINES = (['rules', 'rule'].includes(cmd[1]) ? RULES:ROUTINES)
        var index = cmd[2]-1;
        logInput(`you ask your being to ${wrapCmd(deleteWord)} the ${ruleOrRoutine} with the number ${cmd[2]}...`)
        if(cmd.length < 3 || !EDITABLE_withSingular.includes(cmd[1])) {
          logError(`to make your being ${wrapCmd(deleteWord)} a rule, simply write ${wrapCmd('forget rule <i>number</i>')}, like  ${deleteExample} :)`);
          return;
        }
        if(index >= RULESorROUTINES.length) {
          logError(`your being does not remember the ${ruleOrRoutine} with the number ${cmd[2]}, so it can't ${wrapCmd(deleteWord)} it!`)
          return;
        }
        RULESorROUTINES.splice(index, 1);
        logOutput(`your being forgot the ${ruleOrRoutine} with the number ${cmd[2]} :)`)
        if(ruleOrRoutine == 'rule') {
          this.pb.rulesParsed.splice(index, 1);
        }
        return;
      }

      case editWord: {
        let ruleOrRoutine = (['rules', 'rule'].includes(cmd[1]) ? 'rule':'routine')
        let RULESorROUTINES = (['rules', 'rule'].includes(cmd[1]) ? RULES:ROUTINES)
        logInput(`you ask your being to ${wrapCmd(editWord)} the ${ruleOrRoutine} with the number ${cmd[2]} :)`)
        if(cmd.length < 4 || !EDITABLE_withSingular.includes(cmd[1]) || !cmd.includes('with')) {
          logError(`hmm, to replace a rule or routine, you need to write ${wrapCmd('replace rule <i>number</i> with <i>new rule</i>')}, for example like ${wrapCmd(editExample)}. to make your being forget a rule, simply write ${wrapCmd('forget rule <i>number</i>')}`);
          return;
        }
        var index = cmd[2]-1;
        if(index >= RULESorROUTINES.length) {
          logError(`your being does not remember the ${ruleOrRoutine} with this number, so it can't ${wrapCmd(editWord)} it!`)
          return;
        }
        this.triggerFoodUpdate = true;
        let oldLength = RULESorROUTINES.length;
        this.processCommand(cmd.slice(4), false)
        if(oldLength < RULESorROUTINES.length) {
          let newRule = RULESorROUTINES.at(-1);
          RULESorROUTINES[index] = newRule;
          RULESorROUTINES.splice(RULESorROUTINES.length-1, 1)
        }
        if(ruleOrRoutine=='rule') {
          this.pb.foodRules.splice(RULESorROUTINES.length-1, 1)
        }
        logOutput(`your being ${wrapCmd(editWord)}d the ${ruleOrRoutine} with the number ${cmd[2]} :)`)
        return;
      }

      case 'hello': { }
      case 'help': {
        output = 'hello! '
        if(cmd.length == 1) {
          output += `the commands that are available are ${wrapCmd(wordsFirst.join(', ').replaceAll('(', '...'))}.`
          logOutput(output)
          logOutput(`to learn more about a specific command, try writing ${wrapCmd('help "command"')}, and replacing "command" with one of the commands above.`)
        } else {
          switch(cmd[1]) {
            case 'eat':
              output += `you can use the ${wrapCmd('eat')} command to tell your being to look for food :). if you give it rules using the ${wrapCmd(ifWord)} about the food it should eat, then it won't just eat the first thing it can.`
              break;
            case 'flee':
              output += `you can use the ${wrapCmd('flee')} command to tell your being to flee from an ${wrapCmd('other_creature')}. if you give it rules using the ${wrapCmd(ifWord)} about the creatures it should flee from, then it won't just flee from anything.`
              break;
            case ifWord:
              output += `with the ${wrapCmd('if')} keyword you can give rules to your being! your being will use these rules to figure out what to ${wrapCmd('eat')} and what to ${wrapCmd('action')} :). An if rule needs to be of the form ${wrapCmd('if <i>condition</i> then <i>action</i>')}, for example: ${wrapCmd(ifExample)}!`;
              break;
            case loopWord:
              output += `to make your being more efficient in eating, you can give it a ${wrapCmd('routine')} to follow so it can do things automatically. for example: ${wrapCmd(loopExample)}.`
              break;
            case stopWord:
              output += `${wrapCmd(stopWord)} will ${wrapCmd(stopWord)} your being from doing the last action you told it to do, probably ${wrapCmd('eat')}ing!`
              break;
            case showWord:
              output += `${wrapCmd(showWord)} will help you learn about the being: use it just like that for a list of everything, or if you want to learn a specific thing, type ${wrapCmd(showWord)} followed by one of the options: ${wrapCmd(wordsToShow.join(', '))}; for example: ${wrapCmd(showWord + ' ' + wordsToShow[Math.floor(Math.random() * wordsToShow.length)])}.`
              break;
            case deleteWord:
              output += `${wrapCmd(deleteWord)} will let you ask the being to forget about a rule or routine, to use it type ${wrapCmd('forget rule <i>number</i>')}, like  ${wrapCmd(deleteExample)}.`
              break;
            case editWord:
              output += `${wrapCmd(editWord)} will let you ask the being to replace a rule or routine, to use it type ${wrapCmd('replace rule <i>number</i> with <i>new rule</i>')}, for example like ${wrapCmd(editExample)}.`
              break;
            case 'help':
              output += `displays this ${wrapCmd('help')} message haha!`
              break;
            case 'clear':
              output += `${wrapCmd('clear')} will remove the logs content so it's less cluttered :).`
              break;
            default:
              output += `we don't know this command, sorry!`
              break;
          }
          logOutput(output)
        }
        return;
      }
      case 'flee': {
        output += `you tell your being to flee!<br>`
        output += this.pb.flee();
        break;
      }

      case 'intro':{
        NARRATION.intro();
        return;
      }
      default: {
        logError(`${wrapCmd(cmd[0])}: is not a known command.<br> 
        try a different one, or try typing ${wrapCmd('help')}!.
        `); // new Color().random().rgba
        return;
      }
    }
    logOutput(output)
  }

  addGameCircle(x, y, radius, color) {
    let circle = this.add.circle(x, y, radius, color.color);
    let matterCircle = this.matter.add.circle(x, y, radius);
    let o = this.matter.add.gameObject(
           circle,
      matterCircle
    )
    o.radius = radius;
    o.color = color;
    return o
  }

  addGameSpriteCircle(x, y, radius, color, texture='circle') {
    let img = new Phaser.GameObjects.Sprite(this, 0, 0, texture);
    img.displayWidth = radius*2;
    img.displayHeight = radius*2;
    img.setTint(color);
  
    let matterCircle = this.matter.add.circle(x, y, radius);
    // this = this.matter.add.gameObject( rt, matterCircle ) 
    img.radius = radius;
    img.color = Color.IntegerToColor(color);
    img.txtr = texture.includes('spiky') ? 'spiky':'smooth';
    img.shape = 'round'
    return this.matter.add.gameObject(img, matterCircle);
  }

  addGameEquiTriangle(x=0, y=0, length=10, color=getRandomColorInCat()) {
    var p0 = new Vector2(x, y+length/2);
    var p1 = new Vector2(x+length*Math.sqrt(2), y)
    var p2 = new Vector2(x, y+length/2) 
    var triangle = this.add.triangle(x, y, p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, color.color);
    var o = this.matter.add.gameObject(triangle, this.matter.add.fromVertices(x, y, [p0, p1, p2]))
    return o;
  }
  addFruit(x, y, radius, color = getRandomColorInCat(), texture = 'circle') {
    if(texture == 'flower') {
      texture = randomElement(flowerTextures);
    } else if(texture.includes('spiky')) {
      texture = randomElement(spikyTextures);
    }
    let img = new Phaser.GameObjects.Sprite(this, 0, 0, texture);
    img.displayWidth = radius*2;
    img.displayHeight = radius*2;
    img.setTint(color.color);

    let rt = this.add.renderTexture(x, y, radius*2, radius*2);
    rt.draw(img, radius, radius);

    let matterCircle = this.matter.add.circle(x, y, radius);
    let o = this.matter.add.gameObject(
           rt,
      matterCircle
    )
    o.radius = radius;
    o.color = color;
    o.txtr= texture.includes('spiky') ? 'spiky':'smooth';
    // o.shape = texture.includes('circle') ? 'round':'edgy'
    o.shape = 'round'
    let s = playersBeing;
    o.setOnCollideWith(s.heady, pair => {
      if(o == this.pb.chosenFood) {
        if(o.displayWidth <= s.heady.displayWidth) {
          let output = ``
          if(sameColorCategory(o.color, s.color) && o.txtr == s.txtr && o.shape == s.shape) {
            output += `the being enjoyed this snack😋<br>`
            if(s.alpha < 1) {
              s.saturate(1)
              s.setAlpha(1);
              output += `it feels healthy again!➕<br>`
            } else {
              s.setScale(0.3+s.scaleX);
              output += `your being was able to grow!🥰<br>`
            }
            if(s.plantLoop && o.group) {
              let oGroupMatchTemp = new Phaser.GameObjects.Group(this, FOOD_MATCHING.getMatching('group', o.group));
              if(oGroupMatchTemp.countActive()) { 
                output += `it will look for more fruit now!<br>`
                s.eating = true; 
              } else if(o.group.countActive()) { logOutput(`no more fruits on this plant match the beings rules`) } 
              else { logOutput(`your being ate all of the fruit on this plant!🌴`) }
            } else {
              output += `it is done eating now...`
              s.eating = false;
            }
          } else {
            //console.log(sameColorCategory(o.color, s.color), o.txtr == s.txtr, o.shape == s.shape)
            output = `oh no, the being did not like what it ate 🤢! it has turned see-through`
            s.setAlpha(0.5);
            if(!sameColorCategory(o.color, s.color)) {
              output += `<br>perhaps it did not like its color 🍎🍏`
            }
            if(!(o.txtr == s.txtr)) {
              output += `<br>perhaps it did not like its texture 🌸🌵`
            }
            if(!(o.shape == s.shape)) {
              output += `<br>perhaps it did not like its shape ⚪⬜`
            }
            output +='...<br>'
            s.eating = false;
          }
          if(o.joints) {
            o.joints.forEach(j => {
              if(o.group) {
                var i = o.group.joints.indexOf(j);
                if(i !== -1) { 
                  console.log(o.group.joints, j, i)
                  o.group.joints.splice(i, 1);
                  console.log(o.group.joints)
                }
              }
              var otherO = j.bodyA.gameObject == o ? j.bodyA.gameObject : j.bodyB.gameObject;
              if(otherO) {
                var i = otherO.joints.indexOf(j);
                if(i !== -1) {
                  console.log(otherO.joints, j, i)
                  otherO.joints.splice(i, 1);
                  console.log(otherO.joints)
                }
              }
            })
            this.matter.world.removeConstraint(o.joints, true);
            o.joints = [];
          }
          o.destroy();
          // FOOD.splice(f_index);
          logOutput(output)
        } else {
          let output = `the being can't eat anything bigger than its head :0<br>`
          if(s.plantLoop && o.group) {
            let oGroupMatchTemp = new Phaser.GameObjects.Group(this, FOOD_MATCHING.getMatching('group', o.group));
            if(oGroupMatchTemp.countActive()) {
              output += `the being takes a look at the other fruits on this plant :)`
              FOOD_MATCHING.kill(o);
            } else {
              output += `there is no more matching food on this plant`
              s.eating = false;
            }
          } else {
            s.eating = false;
          }
          logOutput(output)
        }
      }
    })
    return o;
  }

  addGameCircleTextured(x, y, radius, color =getRandomColorInCat(), texture = 'circle_leopard') {
    
    let g = this.add.graphics()

    let crcl= this.add.circle(0, 0, radius, color.color)
    crcl.fillColor=color.color;
    crcl.removeFromDisplayList()
    
    let patternSprite = new Phaser.GameObjects.Sprite(this, 0, 0, texture);
    // patternSprite.displayWidth = 2*radius;
    // patternSprite.displayHeight = 2*radius;
    
    let mask = new Phaser.Display.Masks.GeometryMask(this, crcl);
    // patternSprite.setMask(mask);
    
    let rt = this.add.renderTexture(x, y, radius*2, radius*2);
    rt.draw(crcl, radius, radius);
    rt.draw(patternSprite, radius, radius);
    rt.setMask(mask);
    // let c = this.add.container(x, y, [crcl, patternSprite, ]);
    
    let matterCircle = this.matter.add.circle(x, y, radius);


    let o = this.matter.add.gameObject(
           rt,
      matterCircle
    ) 
    o.radius = radius;
    o.arc=crcl;
    o.radius = radius;
    o.color = color;
    o.txtr= texture.includes('spiky') ? 'spiky':'smooth';
    // o.shape = texture.includes('circle') ? 'round':'edgy'
    o.shape = 'round'
  
    // TO ENSURE CIRCULAR MASKS ON THE TEXTURE FILES, IF PERFORMANCE HOG JUST CUT OUT THE TEXTURES BY HAND
    this.events.on('postupdate', function() {
      crcl.copyPosition(rt)
    }, this);

    return o;
  }

  renderConstraint(constraints, lineColor, lineOpacity, lineThickness, pinSize=null, anchorColor=null, anchorSize, clear = false) {
    if(clear) {
      this.graphics.clear();
    }
    for(var i=0, n=constraints.length; i<n; i++) {
      this.matter.world.renderConstraint(constraints[i], this.graphics, lineColor, lineOpacity, lineThickness, pinSize, anchorColor, anchorSize);
    }
  }
  
}

function findClosest(A, B=[new Phaser.GameObjects.GameObject()]) {
  let distance = Infinity;
  let closest;
  // console.log(A, B)
  // console.log(A.x, A.y);
  B.forEach(b=> {
    // console.log(b.x, b.y)
    // distance squared is faster
    currentDistance = Distance.Squared(A.x, A.y, b.x, b.y);
    // console.log(A.x, A.y, b.x, b.y)
    if(currentDistance < distance) {
      distance = currentDistance;
      closest = b;
    }
    // console.log(distance)
  })
  return closest;
}

class gameSpriteCircle extends Phaser.GameObjects.GameObject {
  constructor(scene, x, y, radius, color = getRandomColorInCat().color, texture = 'circle') {
    super(scene, 'Arc')
    let img = new Phaser.GameObjects.Sprite(scene, 0, 0, texture);
    img.displayWidth = radius*2;
    img.displayHeight = radius*2;
    img.setTint(color);
  
    let rt = scene.add.renderTexture(x, y, radius*2, radius*2);
    rt.draw(img, radius, radius);
  
    let matterCircle = scene.matter.add.circle(x, y, radius);
    // this = scene.matter.add.gameObject( rt, matterCircle ) 
    this.radius = radius;
    this.color = Color.IntegerToColor(color);
    this.txtr = texture.includes('spiky') ? 'spiky':'smooth';
    this.shape = 'round'
    return scene.matter.add.gameObject(this, matterCircle);
  }
}

class GroupDynVis extends GameObjects.Group {
  someVisible() {
    this.getChildren().some((f, i) => {
      let c = this.scene.cameras.main;
      let mp = c.midPoint;
      let viewRec = new Phaser.Geom.Rectangle(mp.x-c.displayWidth/2, mp.y-c.displayHeight/2, c.displayWidth, c.displayHeight);
      // console.log(viewRec)
      if(Phaser.Geom.Rectangle.Overlaps(viewRec,f.getBounds())) {
        f.visible = true;
        this.visible = true;
        return this.visible;
        // f.setActive(true);
      }
    });
    return this.visible;
  }
  getVisible() {
    let r = []
    this.getChildren().forEach((f, i) => {
      let c = this.scene.cameras.main;
      let mp = c.midPoint;
      let viewRec = new Phaser.Geom.Rectangle(mp.x-c.displayWidth/2, mp.y-c.displayHeight/2, c.displayWidth, c.displayHeight);
      // console.log(viewRec)
      if(Phaser.Geom.Rectangle.Overlaps(viewRec,f.getBounds())) {
        f.visible = true;
        this.visible = true;
        r.push(f);
      }
    });
    return r;
  }
}

class Plant extends GroupDynVis {
  constructor(scene, x=0, y=0, color=new Color().random(), width = 40, fruitsRadius = 10, fruitsNumber = 8, circle = false) {
    super(scene, 0, 0, []);
    this.circle = circle;
    this.color = color
    this.width = width;
    this.fruitsRadius = fruitsRadius;
    this.fruitsNumber = fruitsNumber;
    this.joints = [];
    let angle = DegToRad(Between(0, 360));

    for(let i = 0; i<fruitsNumber; i++) {
      let colorCat = getColorCategory(color);
      if(Math.random() < 0.2) { colorCat = (colorCat+Between(-1, 1)) % COLORCATS.length }
      let texture = 'flower'
      if(Math.random() < 0.2) { texture = 'circle_spiky' }

      let p;
      if(!circle) {
        p = pointOnCircle(x, y, i*width/fruitsNumber*2, angle)
      } else {
        p = pointOnCircle(x, y, width/2, DegToRad(360/fruitsNumber * i));
      }
      let f = scene.addFruit(p.x, p.y, Between(fruitsRadius-5, fruitsRadius+5), getRandomColorInCat(colorCat), texture);
      FOOD.add(f);
      f.group = this;
      this.add(f)
    }

    //else {
      for(let i = 0; i<fruitsNumber; i++) {
        
        let f0 = this.getChildren()[i];
        let f1 = this.getChildren()[(i+1)%fruitsNumber];
        let f2 = this.getChildren()[(i+2)%fruitsNumber];
        if(!f0.joints) f0.joints = []
        if(!f1.joints) f1.joints = []
        if(!f2.joints) f2.joints = []
        if(i+1<fruitsNumber || circle) {
          let j = this.scene.matter.add.joint(f0, f1, undefined, 0.1, );
          if(f0.joints.length < 2 || f1.joints.length < 2 || i==fruitsNumber-1)  { this.joints.push(j) }
          if(f0.joints.length < 2 || i==fruitsNumber-1) { f0.joints.push(j); }
          if(f1.joints.length < 2 || i==fruitsNumber-1) { f1.joints.push(j); }
        }
        if(circle) {
          let j = this.scene.matter.add.joint(f0, f2, undefined, 0.05, )
          if(f0.joints.length < 4 || f2.joints.length < 4)  { this.joints.push(j) }
          if(f0.joints.length < 4) { f0.joints.push(j); }
          if(f2.joints.length < 4) { f2.joints.push(j); }
        }

      }
    //}
    scene.add.existing(this);
  }
  destroy(clearChildren = false, destroyChildren=false) {
    this.scene.matter.world.removeConstraint(this.joints, true);
    super.destroy(clearChildren, destroyChildren);
  }
}