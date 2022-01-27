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

let FRUIT = {}
let FOOD_MINIMUM = 3;

let PLANTS;
let ENEMIES;
let BEINGS;

let playersBeing = new Object

let massMultiplierConstant = 2.2860618138362114;
const { Vector2, Angle, Distance, DegToRad, RadToDeg, Between, FloatBetween } = Phaser.Math;
const { Color } = Phaser.Display;
const { GameObjects } = Phaser; 
const ifExample = 'if fruit is red then eat';
const loopExample = 'while fruit is on plant eat';
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
    this.graphics = this.add.graphics();
    this.newGraphics = this.add.graphics();
    let progressBar = new Phaser.Geom.Rectangle(200, 200, 400, 50);
    let progressBarFill = new Phaser.Geom.Rectangle(205, 205, 290, 40);

    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.fillRectShape(progressBar);

    this.newGraphics.fillStyle(0x3587e2, 1);
    this.newGraphics.fillRectShape(progressBarFill);

    this.loadingText = this.add.text(250,260,"Generating the world...", { fontSize: '32px', fill: '#F0F' });

    this.load.setBaseURL(document.getElementById('phaser_container').getAttribute('data-assets-baseURL')); 
    this.load.image('circle', 'assets/circle.png');
    this.load.image('circle_spiky_1', 'assets/circle_spiky_1.png');
    this.load.image('circle_spiky_2', 'assets/circle_spiky_2.png');
    this.load.image('circle_spiky_3', 'assets/circle_spiky_3.png');
    this.load.image('flower_1', 'assets/flower_1.png');
    this.load.image('flower_2', 'assets/flower_2.png');
    
    this.load.image('square_rounded', 'assets/square_rounded.png');
    this.load.image('circle_leopard', 'assets/circle_leopard.png');
    // this.load.spritesheet('jelly', 'assets/jellyfish_spritesheet.png', {frameWidth: 32, frameHeight: 32})


    this.matter.add.mouseSpring();
    // this.anims.create({key: 'jelly_idle', frames: this.anims.generateFrameNumbers('jelly', {start:0, end:4}), frameRate:5, repeat: -1})
    // this.anims.create({key: 'jelly_jump', frames: this.anims.generateFrameNumbers('jelly', {start:7, end:11}), frameRate:5, repeat: -1})
    // this.anims.create({key: 'jelly_move', frames: this.anims.generateFrameNumbers('jelly', {start:14, end:18}), frameRate:5, repeat: -1})
    // this.anims.create({key: 'jelly_expl', frames: this.anims.generateFrameNumbers('jelly', {start:21, end:27}), frameRate:5, repeat: -1})
    // this.load.svg('antennae', 'assets/antennae-dotgrid.svg')
    SCENE = this;

    this.load.on('progress', this.updateLoadingBar, {newGraphics:this.newGraphics,loadingText:this.loadingText});
    // this.load.on('complete', this.completeLoading, {newGraphics:this.newGraphics,loadingText:loadingText});

    this.mutationObserver = new MutationObserver(function(mutations) {
      // console.log( Math.round((Date.now() - this.lastLogged) / 1000) )
      this.lastLogged = Date.now();
    });
    this.mutationObserver.observe(terminal_log, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
      attributeOldValue: true,
      characterDataOldValue: true
    });
  }
  updateLoadingBar(percentage) {
    percentage = percentage/2;
    this.newGraphics.clear();
    this.newGraphics.fillStyle(0x3587e2, 1);
    this.newGraphics.fillRect(205, 205, percentage*390, 40);
        
    percentage = percentage * 100;
    let t = `Generating the world... ${percentage.toFixed(2)} %`
    console.log(t);
    this.loadingText.setText(t);
    
  }
  completeLoading() {
    console.log("COMPLETE!");
    this.newGraphics.clear()
    this.newGraphics.destroy();
    this.loadingText.destroy();
  }
  create() {
    // SETUP
    this.graphics.destroy();
    this.graphics = this.add.graphics();
    this.gameWidth = this.gameHeight = 10000;
    this.xBorderLeft = -5000;
    this.xBorderRight = this.xBorderLeft+this.gameWidth;
    this.yBorderHigh = -5000;
    this.yBorderLow = this.yBorderHigh + this.gameHeight;
    //this.matter.world.setBounds(this.xBorderLeft, this.yBorderHigh, this.gameWidth*2, this.gameHeight*2, 512)

    this.beingCounter = 0;
    
    ENEMIES = new Phaser.GameObjects.Group(this, []);
    BEINGS = new Phaser.GameObjects.Group(this, []);
    // PLAYERSBEING
    let slug_r = 20;
    let slug_x = getCanvasWidth()/2;
    let slug_y = getCanvasHeight()/2;
    let playersBeingColor = getRandomColorInCat([ COLORCATS_DICT['purple'], COLORCATS_DICT['blue'], COLORCATS_DICT['orange'] ]);
    changeStylesheetRule(document.styleSheets[0], '.beingscolor', `background-color`, `#${playersBeingColor.color.toString(16)}`)
    changeStylesheetRule(document.styleSheets[0], `.${COLORCATS_HR[getColorCategory(playersBeingColor)]}`, `background-color`, `#${playersBeingColor.color.toString(16)}`)
    changeStylesheetRule(document.styleSheets[0], `.color`, `background-color`, `#${playersBeingColor.color.toString(16)} !important`)
    let otherColors = COLORCATS.filter((c, i) => i != getColorCategory(playersBeingColor))
    
    this.pb = new Slug(this, slug_x, slug_y, slug_r, playersBeingColor);
    BEINGS.add(this.pb)
    playersBeing = this.pb;
    this.rulesLength = 0;
    
    // let s1 = new Slug(this, slug_x-280, slug_y-5, 10);
    this.cameras.main.setZoom(1000);
    this.cameras.main.zoomTo(1, 4000, 'Cubic');
    this.cameras.main.startFollow(this.pb.torso, true, 0.03, 0.03);

    this.stage = 1;
    this.slugs = [this.pb];
    
    this.enemySpawned = false;

    // COMPANION
    // this.companion = this.add.sprite(300, 300, 'jelly').setScale(10);
    // this.companion = this.matter.add.gameObject(this.companion, this.matter.add.rectangle(0, 0, this.companion.displayWidth/3, this.companion.displayHeight/2))
    
    FRUIT = new Phaser.GameObjects.Group(this, []);

    let foodsInitial = [ 
      this.addFruit(0, 0, 10, getRandomColorInCat(playersBeingColor), 'flower'),
      this.addFruit(getCanvasWidth(), 0, 15, getRandomColorInCat(playersBeingColor), 'flower'),
      this.addFruit(getCanvasWidth(), getCanvasHeight(), 20, getRandomColorInCat(playersBeingColor), 'flower'),
      this.addFruit(getCanvasWidth(), getCanvasHeight()+5, 20, getRandomColorInCat(playersBeingColor), 'flower'),
      this.addFruit(getCanvasWidth()+5, getCanvasHeight()+5, 20, getRandomColorInCat(playersBeingColor), 'flower'),
      this.addFruit(0, getCanvasHeight(), 25, getRandomColorInCat(playersBeingColor), 'circle_spiky'),
    ];
    
    // FRUIT.maxSize = 15;
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
    
    const generate = function(iterations) {
      if(FRUIT.getChildren('active', true).length < 100) {
        if(i==iterations-1) { console.log('generate loop, ran', iterations, 'times') }

        for(var i = 0; i < iterations; i++) {
          if((i+1)%5 == 0) {this.updateLoadingBar.call({newGraphics:this.newGraphics,loadingText:this.loadingText}, [1+1/25*(i+1)]); }
          let yesOrNo = Between(0, 3)
          let randFN = Between(3, 15) 
          let randFS = Between(15, 150)
          let randSize = Between(randFN*randFS+10, randFN*randFS+10)
          let tooClose = false;
          let distx, disty;
          let tries = 1;
          do {
            tries = tries + 0.1
            distx = this.pb.x+(Math.random()<0.5 ? Between(-5*this.pb.scale, -4000*this.pb.scale):Between(4000*this.pb.scale, 5*this.pb.scale))
            disty = this.pb.y+(Math.random()<0.5 ? Between(-5*this.pb.scale, -4000*this.pb.scale):Between(4000*this.pb.scale, 5*this.pb.scale))
              coordinates.some(p=> {
                let c = this.cameras.main;
                let mp = c.midPoint;
                let viewRec = new Phaser.Geom.Rectangle(mp.x-c.displayWidth/2, mp.y-c.displayHeight/2, c.displayWidth, c.displayHeight);
                // console.log(viewRec)
                let visible = Phaser.Geom.Rectangle.Overlaps(viewRec, new Phaser.Geom.Rectangle(distx-randSize/2, disty-randSize/2, randSize, randSize));
                
                tooClose = ( Math.abs(p.x-distx) < Math.max(randSize/tries, 250/tries) && Math.abs(p.y-disty) < Math.max(randSize/tries, 250/tries) ) || visible;
                // console.log(Math.abs(p.x-distx)+Math.abs(p.y-disty),randSize*3)
                return tooClose;
              })
          } while(tooClose);
          
          coordinates.push({x: distx, y: disty});
          
          let c = getRandomColorInCat();
          
          // this.addFruit(20+c.color%(rand*10), c.color%(rand*10), 5*rand, c, 'flower');
          let plant; 
          if(yesOrNo) {
            plant = new Plant(this, distx, disty, c, randSize, randFS, randFN, true)
          } else {
            plant = new Plant(this, distx, disty, c, randSize, randFS, Math.floor(randFN/3))
          }
          PLANTS.add(plant)
          // let s = new Slug(this, slug_x+i*10*rand, slug_y+i*10*rand, (slug_r+20)*rand/10)
          // this.slugs.push(s);
          this.activeFoodlength = FRUIT.getMatching('active', true)
  
          if(i%2) {
            BEINGS.add(new Slug(this, distx+Between(30, 300), disty+Between(30, 300), Between(30, 60), getRandomColorInCat(otherColors), true, false))
            ENEMIES.add(new Snake(this, distx+Between(30, 300), disty+Between(30, 300), Between(30, 60), getRandomColorInCat()))
          }
  
        } this.completeLoading.call({newGraphics:this.newGraphics,loadingText:this.loadingText});
  
        FRUIT.getChildren().forEach(o => {
          this.setOnCollidesWithForFruit(o);
        })
        ENEMIES.getChildren().forEach(e => {
          e.setOnCollidesWithBeings();
        })
      }
    }

    generate.call(this, [40]);

    var timer = this.time.addEvent({
      delay: 30 * 1000,
      callback: generate,
      args: [2],
      callbackScope: this,
      loop: true,

    });
    
    // RENDER TERMINAL ON TOP OF PHASER
    // const ph_terminal_container = this.add.dom(0.8*document.getElementById("phaser_container").clientWidth, 0.9*document.getElementById("phaser_container").clientHeight/2, terminal_container)
    // const terminal_input = document.getElementById('terminal_input');
    
    terminal_input.addEventListener('cmd', (e) => {
      // WE HAVE A HOOK INTO THE TERMINAL
      this.processCommand(e.detail.value);
    });/*
    let controlConfig = {
      camera: this.cameras.main,
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      // zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS),
      // zoomOut: this.input.mouse.onMouseWheel() ,
      acceleration: 0.03,
      drag: 0.0003,
      maxSpeed: 0.8
    };
    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    this.input.keyboard.preventDefault = false;    
    */
   // NARRATION
   NARRATION.intro_0();
   
  }
  update(time, delta) {
    //this.controls.update(delta)
    this.graphics.clear()
    // console.log(constraints)
    BEINGS.getMatching('active', true).forEach(e => {
      // SHOW THE SKELETONS OF THE SLUGS
      if(e.someVisible()) {
        this.renderConstraint(e.joints, 0xF9F6EE, undefined, e.torso.displayWidth/20);
      }
    })
    ENEMIES.getMatching('active', true).forEach(e => {
      // SHOW THE SKELETONS OF THE SLUGS
      if(e.someVisible()) {
        this.renderConstraint(e.joints, 0xF9F6EE, undefined, e.heady.displayWidth/20);
      }
    })
    let constraints = [ ]
    PLANTS.getMatching('active', true).forEach(p => {
      let visible = p.getVisible();
      if( !(visible.length) && p.circle && p.width < this.pb.torso.displayWidth*1.5) {
        try {
          let f = this.addFruit(p.getFirstAlive().x, p.getFirstAlive().y, p.width/2, p.color, 'flower');
          console.info('replacing',p,'with',f)
          p.destroy(true, true);
        } catch(error) {
          console.warn(error, 'error on trying to replace on growth, none alive in plant?')
        }
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
    if(this.stage == 2 && !(this.pb.plantLoop) && !(NARRATION.loopNudged)) {
      NARRATION.loopNudge();
    }
    if(this.stage == 4 && !this.enemySpawned) {
      this.pb.stop();
      this.enemySpawned = true;
      let x = this.pb.torso.x+this.pb.torso.scale*getCanvasWidth()/2;
      let y = this.pb.torso.y+this.pb.torso.scale*getCanvasHeight()/2
      this.enemy = new Snake(this, x, y, this.pb.torso.displayWidth, getRandomColorInCat(this.pb.color).darken(25));
      this.enemy.name = 'enemy'
      ENEMIES.add(this.enemy);
      console.log(`spawned enemy at`, this.enemy.x, this.enemy.y, this.enemy);
      this.enemy.eat('player');
    }
    let vecTorsoHeady = velocityToTarget(this.pb.torso, this.pb.heady);
    if(Angle.ShortestBetween(RadToDeg(vecTorsoHeady.angle()), this.pb.heady.angle) > 40)
    this.pb.heady.setAngle(RadToDeg(vecTorsoHeady.angle()))
    
    let healthyCount = 0;
    
    FRUIT.getMatching('active', true).forEach(f => {
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
          f.destroy();
      }*/
    })

    if(RULES.length != this.rulesLength || this.triggerFoodUpdate || this.activeFoodlength != FRUIT.getMatching('active', true).length) {
      this.rulesLength = RULES.length;
      this.pb.food_matching.clear();
      let foodSelected = this.pb.evaluateFoodRules(false);
      // this.pb.food_matching = foodSelected;
      this.pb.food_matching.addMultiple(foodSelected.filter(e => (e.displayWidth > this.pb.heady.displayWidth/4 && e.displayWidth < this.pb.heady.displayWidth*3)));

      this.triggerFoodUpdate = false;
      this.activeFoodlength = FRUIT.getMatching('active', true).length
    }   

    this.pb.food_matching.getMatching('visible', true).forEach(f => {
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
      console.log('new fruit because not enough healthy! at', x, y, f)
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
        if(cmd.length < 6 || !(cmd.at(-2) == thenWord) || !(wordsAction.includes(cmd.at(-1))) || !(cmd.includes(ENTITY_TYPES[0])||cmd.includes(ENTITY_TYPES.at(-1))) || cmd.length != new Set(cmd).size) { 
          logInput(output);
          logError(ifError);
          return;
        }
        if(cmd.at(-1) == 'eat' && cmd.at(1) == 'other_creature') { 
          logInput(output);
          logError("your being doesn't understand why it should eat another creature, it is vegan!");
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
        if(cmd.length > 1) {
          output += `<br>but watch out, it did not understand the words after ${wrapCmd(cmd[0])}: "${cmd.slice(1).join(' ')}"<br>
          if you want to specify what the being should eat, you need to use an ${wrapCmd('if')} rule :). type ${wrapCmd('help if')} to figure out how!`
        }
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
        if(['rules', 'rule'].includes(cmd[1]) && cmd.length == 3) {
          if(toShow[2]-1 < RULES.length) {
            logOutput(`this is the rule number ${cmd[2]}.: ${RULES[cmd[2]-1]}.<br>`)
          } else {
            logError(`your being knows no rule number ${cmd[2]}<br>`);
          }
        } else if(['routines', 'routine'].includes(cmd[1]) && cmd.length == 3) {
          if(cmd[2]-1 < ROUTINES.length) {
            logOutput(`this is the routine number ${cmd[1]}.: ${ROUTINES[cmd[1]-1]}.<br>`)
          } else {
            logError(`your being knows no routine number ${toShow[1]}<br>`);
          }
        } else {
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
                  logOutput(`your being does not know any ${wrapCmd(e)} yet. try giving it one by typing ${wrapCmd(RULESorROUTINES == RULES ? ifExample:loopExample)}!<br>`);
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
        }
        return;
      }
      case deleteWord: {
        let ruleOrRoutine = (['rules', 'rule'].includes(cmd[1]) ? 'rule':'routine')
        let RULESorROUTINES = (['rules', 'rule'].includes(cmd[1]) ? RULES:ROUTINES)
        var index = cmd[2]-1;
        logInput(`you ask your being to ${wrapCmd(deleteWord)} the ${ruleOrRoutine} with the number ${cmd[2]}...`)
        if(cmd.length < 3 || !EDITABLE_withSingular.includes(cmd[1])) {
          logError(`to make your being ${wrapCmd(deleteWord)} a rule, simply write ${wrapCmd('forget rule <i>number</i>')}, like  ${wrapCmd(deleteExample)} :)`);
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
              output += `with the ${wrapCmd('if')} keyword you can give rules to your being! your being will use these rules to figure out what to ${wrapCmd('eat')} and from what to ${wrapCmd('flee')} :). An if rule needs to be of the form ${wrapCmd('if <i>condition</i> then <i>action</i>')}, for example: ${wrapCmd(ifExample)}! the being will take all food rules into account when choosing food.`;
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
        if(cmd.length > 1) {
          if(cmd[1] == 0) NARRATION.intro_0();
          else if(cmd[1] == 1) NARRATION.intro_1();
          else if(cmd[1] == 2) NARRATION.intro_2();
          else {
            logError(`this intro section does not exist, only 0, 1 and 2 do.`)
          }
        } else {
          logError(`you forgot to supply a number, which intro message to you want to see?`)
        }
        return;
      }
      case 'fizzbuzz': {
        try {
          if(cmd.length >= 4) {
            fizzbuzz(cmd[1], cmd[2], cmd[3])
          } else if(cmd.length == 3) {
            fizzbuzz(cmd[1], cmd[2])
          } else if(cmd.length == 2) {
            fizzbuzz(cmd[1])
          } else {
            fizzbuzz()
          } 
        } catch (error) {
          console.log(error);
        }
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
    this.setOnCollidesWithForFruit(o);
    FRUIT.add(o);
    return o;
  }

  setOnCollidesWithForFruit(o, beings=[]) {
    if(!beings.length) {
      beings = BEINGS.getChildren('active', true);
    }
    beings.forEach(s=> {
      o.setOnCollideWith(s.heady, pair => {
        if(o == s.chosenFood && s.eating) {
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
                let oGroupMatchTemp = new Phaser.GameObjects.Group(this, this.pb.food_matching.getMatching('group', o.group));
                if(oGroupMatchTemp.getChildren('active', true).length) { 
                  output += `it will look for more fruit now!<br>`
                  s.eating = true; 
                } else if(o.group.getChildren('active', true).length && s == this.pb) { logOutput(`no more fruits on this plant match the beings rules`) } 
                else if(s == this.pb) { logOutput(`your being ate all of the fruit on this plant!🌴`) }
              } else {
                output += `it is done eating now...but you can tell it to eat again to help it grow more :).`
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
              output +=`...
              you should try to get it to eat something that's good for it and matches its characteristics to get it vibrant and healthy again!`
              s.eating = false;
            }
            if(o.joints) {
              o.joints.forEach(j => {
                if(o.group) {
                  var i = o.group.joints.indexOf(j);
                  if(i !== -1) { 
                    o.group.joints.splice(i, 1);
                  }
                }
                var otherO = j.bodyA.gameObject == o ? j.bodyB.gameObject : j.bodyA.gameObject;
                if(otherO) {
                  var i = otherO.joints.indexOf(j);
                  if(i !== -1) {
                    otherO.joints.splice(i, 1);
                  }
                }
              })
              this.matter.world.removeConstraint(o.joints, true);
              o.joints = [];
            }
            o.destroy();
            // FRUIT.splice(f_index);
            if(s == this.pb) {
              logOutput(output)
            }
          } else {
            let output = `the being can't eat anything bigger than its head :0<br>`
            if(s.plantLoop && o.group) {
              let oGroupMatchTemp = new Phaser.GameObjects.Group(this, this.pb.food_matching.getMatching('group', o.group));
              if(oGroupMatchTemp.getChildren('active', true).length) {
                output += `the being takes a look at the other fruits on this plant :)`
                this.pb.food_matching.kill(o);
              } else {
                output += `there is no more matching food on this plant`
                s.eating = false;
              }
            } else {
              s.eating = false;
            }
            if(s == this.pb) {
              logOutput(output)
            }
          }
        }
      })
    })
  }

  setOnCollidesWithForBeings(being, others=[]) {
    if(!others.length) {
      others = BEINGS.getMatching('active', true) 
    }
    others.forEach(b=>{
      being.heady.setOnCollideWith(b.torso, pair => {
        // console.log('snake colliding with', limb, pair)
        if(being.eating && (b.hunter == this || b.torso.hunter == this)) {
          if(being.heady.displayWidth > b.torso.displayWidth) {
            // successfully ate
            b.setAlpha(0.8)
            b.saturate(false);
            b.stop();
            if(this.pb == b) {
              logOutput(`oh no! the angry creature ate your being's color :( try to get it to eat something so it can regain its color!`)
            }
            if(sameColorCategory(being.color, b.color)) {
              being.setScale(being.scale+0.2);
            } else {
              being.setAlpha(0.8);
            }
          } else if(this.pb == b) {
            logOutput(`phew, your being is lucky it is too large to be eaten!`)
          }
          being.eating = false;
        }
      });
    });
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
    let r = new Set();
    this.getChildren().forEach((f, i) => {
      let c = this.scene.cameras.main;
      let mp = c.midPoint;
      let viewRec = new Phaser.Geom.Rectangle(mp.x-c.displayWidth/2, mp.y-c.displayHeight/2, c.displayWidth, c.displayHeight);
      // console.log(viewRec)
      if(Phaser.Geom.Rectangle.Overlaps(viewRec,f.getBounds())) {
        f.visible = true;
        this.visible = true;
        r.add(f)
        // also get objects at other end of joints so joints don't disappear suddendly
        if(f.joints) {
          f.joints.forEach(j => {
            var otherO = j.bodyA.gameObject == f ? j.bodyB.gameObject : j.bodyA.gameObject;
            if(otherO) {
              r.add(otherO);
            }
          })
        }
      }
    });
    return [...r];
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
          if(f0.joints.length < 2 || f1.joints.length < 2 || i==fruitsNumber-1)  { 
            this.joints.push(j)
            f0.joints.push(j); 
            f1.joints.push(j); 
          }
        }
        if(circle) {
          let j = this.scene.matter.add.joint(f0, f2, undefined, 0.05, )
          if(f0.joints.length < 4 || f2.joints.length < 4)  { 
            this.joints.push(j) 
            f0.joints.push(j); 
            f2.joints.push(j); 
          }
          // console.log(f0.joints.length)
        }

      }
    scene.add.existing(this);
  }
  destroy(clearChildren = false, destroyChildren=false) {
    this.scene.matter.world.removeConstraint(this.joints, true);
    super.destroy(clearChildren, destroyChildren);
  }
}