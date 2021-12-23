/* 
** GLOBALS **
*/
// 6 categories of hues, hue of 0 and 1 both correspond to red, so cats need to be shifted by half a value
let COLORCATS_HR  = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink','red']
let COLORCATS_360 = [0, 15, 45, 75, 165, 240, 285, 330]
let COLORCATS     = [ 0 ];

let ATTRIBUTES = ['color', 'texture', 'shape']

let EDITABLE = ['rules', 'routines']
let EDITABLE_withSingular = ['rule', 'routine'].concat(EDITABLE)

for(let i = 0; i < COLORCATS_360.length; i++) {
  COLORCATS[i] = COLORCATS_360[i]/360;
}
// console.log(COLORCATS)

let ENTITY_TYPES = ['food', 'others']

let TEXTURES = ['smooth', 'spiky']

let SIZES = ['smaller', 'bigger']

let SHAPES = ['round', 'edgy']

let RULES = [ ];
let ROUTINES = [ ];

let FOOD = {}
let FOOD_MATCHING = []
let FOOD_MINIMUM = 3;

let PLANTS;

let playersBeing = new Object

let massMultiplierConstant = 2.2860618138362114;
const { Vector2, Angle, Distance, DegToRad, RadToDeg, Between, FloatBetween } = Phaser.Math;
const { Color } = Phaser.Display;
const ifExample = 'if food is red then eat';
const loopExample = 'while food on plant eat';
const editExample = `replace rule 1 with ${ifExample}`;
const deleteExample = 'forget rule 1'

let timerEvents = [ ]

let SCENE;

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
    
    
    let playersBeingColor = getRandomColorInCat();
    this.pb = new Slug(this, slug_x, slug_y, slug_r, playersBeingColor);
    playersBeing = this.pb;
    let pbColorCat = getRandomColorInCat(playersBeingColor)
    
    // let s1 = new Slug(this, slug_x-280, slug_y-5, 10);
    this.cameras.main.startFollow(this.pb.torso, true, 0.08, 0.08);
    this.stage = 1;
    this.slugs = [this.pb];
    
    let foodsInitial = [ 
      this.addFood(0, 0, 10, pbColorCat, 'flower'),
      this.addFood(getCanvasWidth(), 0, 15, pbColorCat, 'flower'),
      this.addFood(getCanvasWidth(), getCanvasHeight(), 20, pbColorCat, 'flower'),
      this.addFood(getCanvasWidth(), getCanvasHeight()+5, 20, pbColorCat, 'flower'),
      this.addFood(getCanvasWidth()+5, getCanvasHeight()+5, 20, pbColorCat, 'flower'),
      this.addFood(0, getCanvasHeight(), 25, pbColorCat, 'circle_spiky'),
    ];
    
    FOOD = new Phaser.GameObjects.Group(this, foodsInitial);
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
        distx = playersBeing.x+(Math.random()<0.5 ? Between(-4000*playersBeing.scale, -400*playersBeing.scale):Between(400*playersBeing.scale, 4000*playersBeing.scale))
        disty = playersBeing.y+(Math.random()<0.5 ? Between(-4000*playersBeing.scale, -400*playersBeing.scale):Between(400*playersBeing.scale, 4000*playersBeing.scale))
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
      
      // FOOD.add(this.addFood(20+c.color%(rand*10), c.color%(rand*10), 5*rand, c, 'flower'));
      let plant; 
      if(yesOrNo) {
        plant = new Plant(this, distx, disty, c, randSize, randFS, randFN, true)
      } else {
        plant = new Plant(this, distx, disty, c, randSize, randFS, Math.floor(randFN/3))
      }
      PLANTS.add(plant)
      // let s = new Slug(this, slug_x+i*10*rand, slug_y+i*10*rand, (slug_r+20)*rand/10)
      // this.slugs.push(s);
    }
    
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

    /*timerEvents.push(
      this.time.addEvent({ delay: Between(2000, 8000),
          loop: true, callbackScope: this, callback: function() {
            // updateHealthyFood();
            // console.log(FOOD_HEALTHY)
            if(FOOD_HEALTHY.getMatching('active', true).length < FOOD_MINIMUM) {
              let distx = playersBeing.x+(Math.random()<0.5 ? Between(-3000*playersBeing.scale, -1000*playersBeing.scale):Between(1000*playersBeing.scale, 3000*playersBeing.scale))
              let disty = playersBeing.y+(Math.random()<0.5 ? Between(-3000*playersBeing.scale, -1000*playersBeing.scale):Between(1000*playersBeing.scale, 3000*playersBeing.scale))
              let texture = Math.random()<0.5 ? 'flower':'circle_spiky'
              let newFood = this.addFood(
                distx, disty, 
                Between(playersBeing.heady.radius, playersBeing.heady.radius * playersBeing.scale), 
                pbColorCat, texture);
              // console.log(`spawning new food near being at ${newFood.x}, ${newFood.y}`, newFood)
              // console.log(FOOD.getChildren().length, FOOD_HEALTHY.getChildren().length)
              FOOD.add(newFood);
              FOOD_HEALTHY.add(newFood);
              console.log(FOOD.getChildren().length, FOOD_HEALTHY.getChildren().length)
            }
          }})
    );*/
    // NARRATION
    narration_intro();

  }


  update(time, delta) {
    // console.log(constraints)
    let constraints = [ ]
    this.slugs.forEach(e => {
      // SHOW THE SKELETONS OF THE SLUGS
      constraints = constraints.concat(e.jointsBody);
    })
    this.renderConstraint(constraints, 0xF9F6EE, 1*playersBeing.scale, 1*playersBeing.scale, 1*playersBeing.scale, 0xF9F6EE, 1*playersBeing.scale, true);
    constraints = [ ]
    PLANTS.getChildren().forEach(p => {
      if(p.circle && p.width < playersBeing.torso.displayWidth*1.5) {
        let f = this.addFood(p.getFirstAlive().x, p.getFirstAlive().y, p.width/2, p.color, 'flower');
        console.log('replacing',p,'with',f)
        FOOD.add(f)
        p.destroy(true, true);
        return;
      }
      let someFVisible = false;
      p.getChildren().some((f, i) => {
        if(!p.countActive()) {
          p.constraints = [];
        }
        let c = this.cameras.main;
        let mp = c.midPoint;
        let viewRec = new Phaser.Geom.Rectangle(mp.x-c.displayWidth/2, mp.y-c.displayHeight/2, c.displayWidth, c.displayHeight);
        // console.log(viewRec)
        if(Phaser.Geom.Rectangle.Overlaps(viewRec,f.getBounds())) {
          someFVisible = true;
          // return someFVisible;
          // f.setActive(true);
        } else {
         // f.setActive(false); 
        }
      })
      if( someFVisible && (playersBeing.scale <= 10 || (p.circle && (p.fruitsNumber < 16 || p.fruitsRadius > playersBeing.heady.displayWidth/2-50))) ) { //  && constraints.length < 80
        this.renderConstraint(p.joints, 0x006400, 0.8, 3, 1, 0x006400, 4, false);
      }
      else {
        // p.destroy();  
      }
    })
    
    if(this.pb.scale > this.stage+1) {
      this.stage++;
      this.cameras.main.zoomTo(1/this.stage, 2000, 'Sine.easeInOut');
    }
    this.controls.update(delta)
    
    let vecTorsoHeady = velocityToTarget(this.pb.torso, this.pb.heady);
    if(Angle.ShortestBetween(RadToDeg(vecTorsoHeady.angle()), this.pb.heady.angle) > 40)
    this.pb.heady.setAngle(RadToDeg(vecTorsoHeady.angle()))
    /*
    if(this.follow = true) {
      this.cameras.main.scrollX = this.pb.torso.x - document.getElementById("phaser_container").clientWidth/2;
      this.cameras.main.scrollY = this.pb.torso.y - document.getElementById("phaser_container").clientHeight/2;
    }*/
    // this.slugs.forEach(element => { element.moveRandomly() });
    
    let healthyCount = 0;
    FOOD.getMatching('active', true).forEach(f => {
      if(sameColorCategory(f.color, f.color) && f.txtr == this.pb.txtr && f.shape == this.pb.shape && f.radius < this.pb.heady.displayWidth/2) {
        healthyCount++;
      }
      /*if(f.displayWidth*15 < this.pb.heady.displayWidth/2 && !f.group) {
          let newFood = this.addFood(
            playersBeing.x+(Math.random()<0.5 ? Between(-3000*playersBeing.scale, -1000*playersBeing.scale):Between(1000*playersBeing.scale, 3000*playersBeing.scale)), 
            playersBeing.y+(Math.random()<0.5 ? Between(-3000*playersBeing.scale, -1000*playersBeing.scale):Between(1000*playersBeing.scale, 3000*playersBeing.scale)),
            playersBeing.displayWidth/2-5,
            f.color,
            f.txtr  
          )
          console.log('replacing', f, 'with', newFood);
          FOOD.add(newFood)
          f.destroy();
      }*/
    })
    
    // console.log(healthyCount)
    if(healthyCount<FOOD_MINIMUM) {
      let x = playersBeing.x+(Math.random()<0.5 ? Between(-1000*playersBeing.scale, -500*playersBeing.scale):Between(500*playersBeing.scale, 1000*playersBeing.scale)), 
      y = playersBeing.y+(Math.random()<0.5 ? Between(-1000*playersBeing.scale, -500*playersBeing.scale):Between(500*playersBeing.scale, 1000*playersBeing.scale));
      let f = this.addFood(
        x, y,
        playersBeing.displayWidth/2-5,
        getRandomColorInCat(this.pb.color),
        'flower'  
      )
      FOOD.add(f)
      console.log('new food because not enough eatable! at', x, y, f)
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
      this.companion.setRotation(playersBeing.torso.rotation+DegToRad(90));
      // this.companion.x = playersBeing.torso.x+30*playersBeing.scale;
      // this.companion.y = playersBeing.torso.y+30*playersBeing.scale;      
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
        if(cmd.length < 6 || !cmd.at(-2) == thenWord || !wordsAction.includes(cmd.at(-1))) { 
          logOutput(ifError);
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

        let oldLength = RULESorROUTINES.length;
        this.processCommand(cmd.slice(4), false)
        if(oldLength < RULESorROUTINES.length) {
          let newRule = RULESorROUTINES.at(-1);
          RULESorROUTINES[index] = newRule;
          RULESorROUTINES.splice(RULESorROUTINES.length-1, 1)
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
            case 'avoid':
              output += `TODO`
              break;
            case ifWord:
              output += `with the ${wrapCmd('if')} keyword you can give rules to your being! your being will use these rules to figure out what to ${wrapCmd('eat')} and what to ${wrapCmd('avoid')} :). An if rule needs to be of the form ${wrapCmd('if <i>condition</i> then <i>action</i>')}, for example: ${wrapCmd(ifExample)}!`;
              break;
            case loopWord:
              output += `TODO`
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
      case 'intro':{
        narration_intro();
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

  addGameEquiTriangle(x=0, y=0, length=10, color=getRandomColorInCat()) {
    var p0 = new Vector2(x, y+length/2);
    var p1 = new Vector2(x+length*Math.sqrt(2), y)
    var p2 = new Vector2(x, y+length/2) 
    var triangle = this.add.triangle(x, y, p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, color.color);
    var o = this.matter.add.gameObject(triangle, this.matter.add.fromVertices(x, y, [p0, p1, p2]))
    return o;
  }
  addFood(x, y, radius, color = getRandomColorInCat(), texture = 'circle') {
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
      if(o.targeted) {
        if(o.displayWidth <= s.heady.displayWidth) {
          let output = ``
          if(sameColorCategory(o.color, s.color) && o.txtr == s.txtr && o.shape == s.shape) {
            output += `the being enjoyed this snack😋<br>`
            if(s.alpha < 1) {
              s.setAlpha(1);
              output += `it feels healthy again!➕<br>`
            } else {
              s.setScale(0.3+s.scaleX);
              output += `your being was able to grow!🥰<br>`
            }
            if(s.plantLoop && o.group) {
              if(o.group.countActive() && FOOD_MATCHING.getMatching('group', o.group).length) { 
                output += `it will look for more food now!<br>`
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
          o.targeted = false;
          if(o.joints) {
            if(o.group) {
              o.joints.forEach(j => {
                let i = o.group.joints.indexOf(j);
                if(i !== -1) {
                  o.group.joints.splice(i, 1);
                }
              })
            }
            this.matter.world.removeConstraint(o.joints, true);
          }
          o.destroy();
          // FOOD.splice(f_index);
          logOutput(output)
        } else {
          let output = `the being can't eat anything bigger than its head :0<br>`
          if(s.plantLoop && o.group) {
            if(o.group.countActive() && FOOD_MATCHING.countActive()) {
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
        o.targeted = false;
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

  renderConstraint(constraints, lineColor, lineOpacity, lineThickness, pinSize, anchorColor, anchorSize, clear = true) {
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
  }
}

class Plant extends Phaser.GameObjects.Group {
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
      let f = scene.addFood(p.x, p.y, Between(fruitsRadius-5, fruitsRadius+5), getRandomColorInCat(colorCat), texture);
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
          let j = this.scene.matter.add.joint(f0, f1, Distance.BetweenPoints(f0, f1), 0.3, );
          // if(!circle) {
            // }
          if(f0.joints.length < 2) { f0.joints.push(j); }
          if(f1.joints.length < 2) { f1.joints.push(j); }
          if(f0.joints.length < 2 || f1.joints.length < 2)  { this.joints.push(j) }
        }
        if(circle) {
          let j = this.scene.matter.add.joint(f0, f2, Distance.BetweenPoints(f0, f2), 0.5, )
          if(f0.joints.length < 4) { f0.joints.push(j); }
          if(f1.joints.length < 4) { f1.joints.push(j); }
          if(f0.joints.length < 4 || f1.joints.length < 4)  { this.joints.push(j) }
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


class lilSlug extends Phaser.GameObjects.Container {
  constructor(scene=Scene2, x=0, y=0, radius=20, color=getRandomColorInCat()) {
    super(scene, x, y);
    this.setDataEnabled();
    this.data.values.color = color;
    this.color = color
    this.txtr = 'smooth';
    this.shape = 'round';
    let headyColor = getRandomColorInCat(getColorCategory(this.color)).lighten((Math.min(0.2+Math.random(), 0.8))*50);
    let tailColor = getRandomColorInCat(getColorCategory(this.color)).lighten((Math.min(0.1+Math.random(), 0.8))*30);

    let headyRadius = radius/1.5
    let tail0Radius = radius/1.3
    let tail1Radius = radius/2
    x=0, y=0;
    this.heady   = this.scene.addGameCircle(x, y, headyRadius, headyColor);
    this.torso   = this.scene.addGameCircle(x-radius-headyRadius, y, radius, this.color);
    this.tail0 = this.scene.addGameCircle(x-radius-headyRadius-tail0Radius, y, tail0Radius, tailColor);

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
    this.jointsBody = [
      this.headyjoint,
      this.torsojoint,
    ]
    this.joints = [...this.jointsBody]


    this.joints.forEach(e => {
      e.originalLength = e.length;
    })



    this.bodyparts = [this.heady, this.torso, this.tail0]; //, this.tail1, this.a1, this.a2, 
    this.bodyparts.forEach((e, i) => {
      // e.setCollisionGroup(i);
      // e.setCollidesWith(0);
      // this.add(e);
      e.setBounce(0.0)
    })
    this.alpha = 1;
    this.tint = color.color;
    // this.setScale(1);
    // this.body = this.torso.body;
    this.add(this.bodyparts);
    scene.add.existing(this);
    const { width, height } = this.getBounds();
    this.setSize(width, height);

  }
  /*
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
        rt.setMask(mask);
      }
    });
    for(let i = 0; i < this.jointsBody.length; i++) {
      let j = this.jointsBody[i];
      let diff = sX-1;
      j.length = (2+j.originalLength)*(1+diff*Math.PI/2);
      // if(j.length < 2+this.heady.radius*this.scale+this.torso.radius*this.scale)
      // j.length = 2+(this.bodyparts[i].radius*this.scale+this.bodyparts[i+1].radius*this.scale)/2
      // j.length = Math.max(2+(j.bodyA.circleRadius+j.bodyB.circleRadius)/2, j.originalLength*(1+diff*Math.PI/2))
    }
    
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
  */
  
  moveRandomly() {
    this.scene.matter.applyForce(this.heady, {x: FloatBetween(-0.2, 0.2), y: FloatBetween(-0.2, 0.2)})
  }

  eat(foodType='any') {
    this.eating = true;
    if(RULES.length) {
      logOutput(`first, the being thinks of the ${wrapCmd('rules')} you gave it.`)
    }
    
    let rulesFood = [ ];
    FOOD_MATCHING = new Phaser.GameObjects.Group(this.scene);
    
    for(let i = 0; i < RULES.length; i++) {
      let ifColor = false;
      let ifTexture = false;
      let ifSize = false;
      let ifShape = false;
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
          if(COLORCATS_HR.includes(e) || e=='color') {
            ifColor = true;
          }
          if(TEXTURES.includes(e) || e=='texture') {
            ifTexture = true;
          }
          if(SIZES.includes(e) || e=='size') {
            ifSize = true;
          }
          if(SHAPES.includes(e) || e=='shape') {
            ifSize = true;
          }
        });
        rulesFood.push({
          booleanExpr,
          ifColor,
          ifTexture,
          ifSize,
          ifShape,
          avoid,
        });
      }
    }

    if(rulesFood.length) {
      logOutput(`it remembers the following food ${wrapCmd('rules')}:`)
      let foodSelected = FOOD.getMatching('active', true);
      
      for(let i = 0; i < rulesFood.length; i++) {
        let foodCurrentlySelected = [ ];
        let r = rulesFood[i]; 
        let booleanExpr = r.booleanExpr;
        let booleanString = booleanExpr.join(' '); // .splice(1, 0, '(').push(')')
        logOutput(`${i+1}. ${wrapCmd(booleanString.replaceAll("'", ""))} ${i<rulesFood.length-1 ? 'and' : ''}`)
        booleanString = booleanString.replaceAll(equalWord, '==').replaceAll(andWord, '&&').replaceAll(` ${orWord}`, ` ||`);
        if(booleanString.includes('beings ')) {
          ATTRIBUTES.forEach( (e,i) => {
            if(booleanString.includes(`beings ${e}`)) {
              // console.log(booleanString, e)
              let replacement = playersBeing[e];
              if(replacement instanceof Color) {
                replacement = COLORCATS_HR[getColorCategory(replacement)];
              }
              booleanString = booleanString.replaceAll(`beings ${e}`, `'${replacement}'`)
            }
          })
        }

        for(let i = 0; i < foodSelected.length; i++) {
          let f = foodSelected[i];
          // VARIABLE NAME NEEDS TO BE SAME AS INPUT!!
          let food = '';
          if(r.ifColor) {
            food = COLORCATS_HR[getColorCategory(f.color)];
          }
          if(r.ifSize) {
            if(booleanString.includes('beings size')) {
              booleanString.replaceAll('beings size', `'beings size'`);
              food = (this.heady.displayWidth > f.displayWidth - 5*this.scale || this.heady.displayWidth < f.displayWidth - 5*this.scale ? "beings size":"not same size" );
            } else{
              food = (this.heady.displayWidth < f.displayWidth ? 'bigger':'smaller' )
            }
          }
          if(r.ifTexture) {
            food = f.txtr;
          }
          // console.log(booleanString, 'food var:', food);
          let evaluation = eval(booleanString);
          // console.log(evaluation);
          if(evaluation && !r.avoid) {
            foodCurrentlySelected.push(foodSelected[i]);
          }
        }
        // console.log(foodCurrentlySelected);
        foodSelected = foodCurrentlySelected;
      }
      // FOOD_MATCHING = foodSelected;
      FOOD_MATCHING.clear()
      FOOD_MATCHING.addMultiple(foodSelected);
    } else {
      logOutput(`none of the ${wrapCmd('rules')} tell your being what to eat, so it will try to eat anything!`)
      // FOOD_MATCHING = FOOD.getMatching('active', true);
      FOOD_MATCHING.clear()
      FOOD_MATCHING.addMultiple(FOOD.getMatching('active', true));
      
    }
    if(!FOOD_MATCHING.countActive()) {
      logOutput(`there is no food item which matches your beings ${wrapCmd('rules')} close enough - try ${wrapCmd(editWord)}ing your ${wrapCmd('rules')} or moving your being closer :)`)
      this.eating = false;
      return
    }
    if(ROUTINES.length) {
      logOutput(`then, the being thinks of the ${wrapCmd('routines')} you gave it.`)
    }

    this.foodRoutines = []
    ROUTINES.forEach(r => {
      r = r.split(' ')
      if(r.at(-1)=='eat') {
        let routine = r;
        if(r.includes('plant')) {
          this.foodRoutines.push({
            routine,
            plant: true,
          });
        }
        else if(r.includes('close')) {
          this.foodRoutines.push({
            routine,
            proximity: true,
          });
        }
      }  
    })
    if(this.foodRoutines.length) {
      logOutput(`it remembers the following food ${wrapCmd('routines')}:`) 
    }
    this.foodRoutines.forEach((r, i) => {
      logOutput(`${i+1}. ${wrapCmd(r.routine.join(' '))} ${i<this.foodRoutines.length-1 ? 'and' : ''}`)
      if(r.plant) {
        this.plantLoop = true;
      }
      if(r.proximity) {
        this.proximityLoop = true;
      }
    })
    // having found our food stuff, move to it until you're close!
    this.closestMatch = findClosest(this.heady, FOOD_MATCHING.getMatching('active', true));
    this.closestMatch.targeted = true;
    let plant = this.closestMatch.group;
    let rotationDirection = 0;
   
    let swimStates = [-20, 0, 20, 0];
    swimStates.forEach((e, i) => {swimStates[i] = DegToRad(e)})
    let waveIndex = 0;

    this.timer = 0;
    this.scene.events.on('update', function(time, delta) {
      if(this.eating && FOOD_MATCHING.countActive()){
        FOOD_MATCHING.getMatching('active', true).forEach((e, i) => {
          if(!e.active) {
            FOOD_MATCHING.remove(e);
          }
          if(plant && e.group != plant) {
            FOOD_MATCHING.remove(e);
          }
        })
        let closestMatchNew = findClosest(this.heady, FOOD_MATCHING.getMatching('active', true));
        if(!this.closestMatch.active) {
          this.closestMatch.targeted = false;
          this.closestMatch = closestMatchNew;
          this.closestMatch.targeted = true;
        }
        // console.log(this.closestMatch)
        
        let target = velocityToTarget(this.heady, this.closestMatch);
        let distanceToFood = Distance.BetweenPoints(this.heady, this.closestMatch)

        let vecTorsoHeady = velocityToTarget(this.torso, this.heady)
        let angleSlugTarget = Angle.ShortestBetween(RadToDeg(vecTorsoHeady.angle()), RadToDeg(target.angle()));
        
        let speed = 4*this.scale;
  
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

        let correctionAngle = DegToRad(40);
        // console.log(Math.round(angleSlugTarget), rotationDirection)
        
        if((angleSlugTarget > 0 && angleSlugTarget < 70)||(angleSlugTarget < 0 && angleSlugTarget > -70)){
          headyVec.add(target);
          this.torso.setVelocity(headyVec.x, headyVec.y);
          this.heady.setVelocity(headyVec.x, headyVec.y);
          // this.heady.applyForce(this.heady, this.heady, headyVec);
          this.heady.setAngle(RadToDeg(headyVec.angle()))
          
          
          if(distanceToFood > 50) {
            // this.tail1.setVelocity(headyVec.x, headyVec.y);
            tail0Vec.rotate(swimStates[waveIndex]); // headyVec.mirror(vecTorsoHeady);
            this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
          }
        }
        else if(rotationDirection == -1 && (angleSlugTarget > 50 || angleSlugTarget < -50)) {
          // console.log('counter clockwise')
          
          let torsoVec = headyVec.clone().setLength(0.25*speed);
          this.torso.setVelocity(torsoVec.x, torsoVec.y);
          headyVec.setAngle(this.heady.rotation - correctionAngle)
          tail0Vec.setAngle(this.tail0.rotation + correctionAngle);
          // headyVec.add(target);
          this.heady.setVelocity(headyVec.x, headyVec.y);
          this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
        }
        else if(rotationDirection == 1 && (angleSlugTarget > 50 || angleSlugTarget < -50)) {
          // console.log('clockwise (right)')
          
          let torsoVec = headyVec.clone().setLength(0.25*speed);
          this.torso.setVelocity(torsoVec.x, torsoVec.y);
          headyVec.setAngle(this.heady.rotation + correctionAngle)
          tail0Vec.setAngle(this.tail0.rotation - correctionAngle);
          // headyVec.add(target);
          this.heady.setVelocity(headyVec.x, headyVec.y);
          this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
        }
        
        
        if(closestMatchNew && this.closestMatch != closestMatchNew) {
          let closer = Distance.BetweenPoints(this.heady, closestMatchNew) - distanceToFood;
          if( closer > 5){
            
            console.log(closestMatchNew)
            closestMatchNew.targeted = true;
            this.closestMatch.targeted = false;
            this.closestMatch = closestMatchNew;
            rotationDirection = 0;
            console.log('target switched')
            this.chosenFood = this.closestMatch;
          } 
        }
        plant = this.closestMatch.plant;
        if(!closestMatchNew && plant) {
          FOOD_MATCHING.addMultiple(plant.getMatching('visible', true));
        }
        this.timer += delta;
        while(this.timer > 600) {
          // console.log('slugtimer')
          waveIndex = (waveIndex+1) % swimStates.length;
          this.timer -= 600;
        }
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