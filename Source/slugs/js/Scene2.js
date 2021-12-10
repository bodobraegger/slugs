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
console.log(COLORCATS)

let ENTITY_TYPES = ['food', 'others']

let TEXTURES = ['smooth', 'spiky']

let SIZES = ['smaller', 'bigger']

let SHAPES = ['round', 'edgy']

let RULES = [ ];
let ROUTINES = [ ];

let FOOD = {}
let FOOD_MATCHING = []
let FOOD_HEALTHY = []
let FOOD_MINIMUM = 3;

let playersBeing = new Object

let massMultiplierConstant = 2.2860618138362114;
const ifExample = 'if food is red then eat';
const forExample = 'while there is food eat';
const editExample = `replace rule 1 with ${ifExample}`;
const deleteExample = 'forget rule 1'

let timerEvents = [ ]

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
    
    
    let playersBeingColor = getRandomColorInCat();
    this.playersBeing = new Slug(this, slug_x, slug_y, slug_r, playersBeingColor);
    playersBeing = this.playersBeing;
    
    // let s1 = new Slug(this, slug_x-280, slug_y-5, 10);
    this.cameras.main.startFollow(this.playersBeing.torso, true, 0.008, 0.008);
    this.stage = 1;
    this.slugs = [this.playersBeing];
    
    let foodsInitial = [ 
      // new gameSpriteCircle(this, 0, 0, 10, playersBeingColor.color, 'flower'),
      // new gameSpriteCircle(this, getCanvasWidth(), 0, 15, playersBeingColor.color, 'flower'),
      // new gameSpriteCircle(this, getCanvasWidth(), getCanvasHeight(), 20, playersBeingColor.color, 'flower'),
      // new gameSpriteCircle(this, 0, getCanvasHeight(), 25, playersBeingColor.color, 'circle_spiky'),
      this.addGameSpriteCircle(0, 0, 10, getRandomColorInCat(getColorCategory(playersBeing.color)), 'flower'),
      this.addGameSpriteCircle(getCanvasWidth(), 0, 15, getRandomColorInCat(getColorCategory(playersBeing.color)), 'flower'),
      this.addGameSpriteCircle(getCanvasWidth(), getCanvasHeight(), 20, getRandomColorInCat(getColorCategory(playersBeing.color)), 'flower'),
      this.addGameSpriteCircle(getCanvasWidth(), getCanvasHeight()+5, 20, getRandomColorInCat(getColorCategory(playersBeing.color)), 'flower'),
      this.addGameSpriteCircle(getCanvasWidth()+5, getCanvasHeight()+5, 20, getRandomColorInCat(getColorCategory(playersBeing.color)), 'flower'),
      this.addGameSpriteCircle(0, getCanvasHeight(), 25, getRandomColorInCat(getColorCategory(playersBeing.color)), 'circle_spiky'),
    ];
    
    FOOD = new Phaser.GameObjects.Group(this, foodsInitial)

    console.log(FOOD)

    for(var i = 0; i < 5; i++) {
      let rand = (Math.random()+0.2)*10
      let c = getRandomColorInCat();
      
      FOOD.add(this.addGameSpriteCircle(20+c.color%(rand*10), c.color%(rand*10), 5*rand, c, 'flower'));
      
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

    timerEvents.push(
      this.time.addEvent({ delay: Phaser.Math.Between(1000, 8000),
          loop: true, callbackScope: this, callback: function() {
            FOOD_HEALTHY = getHealthyFood(playersBeing);
            if(FOOD_HEALTHY.length < FOOD_MINIMUM) {
              let newFood = this.addGameSpriteCircle(
                playersBeing.x+Phaser.Math.Between(-500, 500), playersBeing.y+Phaser.Math.Between(-500, 500), 
                Phaser.Math.Between(playersBeing.heady.radius, playersBeing.heady.radius * playersBeing.scale), 
                getRandomColorInCat(getColorCategory(playersBeing.color)), 'flower');
              console.log(`spawning new food near being at ${newFood.x}, ${newFood.y}`, newFood)
              FOOD.add(newFood);
              FOOD_HEALTHY.push(newFood);
            }
          }})
    );
    // NARRATION
    narration_intro();

  }


  update(time, delta) {
    // EATING THE FOOD
    FOOD.getMatching('active', true).forEach((f, f_index) => {
      // this.slugs.forEach
      [this.playersBeing].forEach(s => { 
        f.setOnCollideWith(s.heady, pair => {
          if(f.targeted) {
            if(f.radius <= s.heady.radius*s.heady.scaleX) {
              let output = ``
              if(sameColorCategory(f.color, s.color) && f.txtr == s.txtr && f.shape == s.shape) {
                output += `the being enjoyed this snack😋<br>`
                if(s.alpha < 1) {
                  s.setAlpha(1);
                  output += `it feels healthy again!➕<br>`
                } else {
                  s.setScale(0.3+s.scaleX);
                  output += `your being was able to grow!🥰<br>`
                }
              } else {
                //console.log(sameColorCategory(f.color, s.color), f.txtr == s.txtr, f.shape == s.shape)
                output = `oh no, the being did not like what it ate!🤢<br>`
                s.setAlpha(0.5);
                if(!sameColorCategory(f.color, s.color)) {
                  output += `perhaps it did not like its color 🤕...<br>`
                }
                if(!(f.txtr == s.txtr)) {
                  output += `perhaps it did not like its texture 🤕...<br>`
                  console.log('what')
                }
                if(!(f.shape == s.shape)) {
                  output += `perhaps it did not like its shape 🤕...<br>`
                }
              }
              f.targeted = false;
              FOOD.kill(f);
              f.destroy();
              s.eating = false;
              // FOOD.splice(f_index);
              logOutput(output)
            } else {
              logOutput(`the being can't eat anything bigger than its head :0`)
              s.eating = false;
            }
            f.targeted = false;
          }
          
        })
      })
    }); 
    let constraints = [ ]
    this.slugs.forEach(e => {
      // SHOW THE SKELETONS OF THE SLUGS
      constraints = constraints.concat(e.jointsBody);
    })
    this.renderConstraint(constraints, 0xF9F6EE, 1, 1, 1, 0xF9F6EE, 1);

    if(this.playersBeing.scale > this.stage+1) {
      this.stage++;
      this.cameras.main.zoomTo(1/this.stage, 2000, 'Sine.easeInOut');
    }
    this.controls.update(delta)
    
    let vecTorsoHeady = velocityToTarget(this.playersBeing.torso, this.playersBeing.heady);
    if(Phaser.Math.Angle.ShortestBetween(Phaser.Math.RadToDeg(vecTorsoHeady.angle()), this.playersBeing.heady.angle) > 40)
    this.playersBeing.heady.setAngle(Phaser.Math.RadToDeg(vecTorsoHeady.angle()))
    /*
    if(this.follow = true) {
      this.cameras.main.scrollX = this.playersBeing.torso.x - document.getElementById("phaser_container").clientWidth/2;
      this.cameras.main.scrollY = this.playersBeing.torso.y - document.getElementById("phaser_container").clientHeight/2;
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
      case forWord: {
        if(cmd.length < 5 || !wordsAction.includes(cmd.at(-1))) { 
          logOutput(`uh oh, a for routine needs to be of the form ${wrapCmd('for <i>condition</i> <i>action</i>')}, for example: ${wrapCmd(forExample)}!`);
          return;
        }
        return;
      }
      case 'abracadabra': {
        this.playersBeing.moveRandomly();
        this.playersBeing.joints.forEach(e=>{
          this.matter.world.removeConstraint(e);
        }); 
        output = `oh no! that was a bad magic trick.`
        break;
      }
      case 'move': {
        this.playersBeing.moveRandomly();
        output = `moving your being around :).`
        break;
      }
      case 'eat': {
        output += `you tell your being to eat.`
        logInput(output)
        this.playersBeing.eat();
        return;
      }
      case stopWord: {
        this.playersBeing.stop();
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
              logOutput(`your being tells you its ${wrapCmd(e)} is ${wrapCmd(COLORCATS_HR[getColorCategory(this.playersBeing.color)])}.`); 
            } else if(e=='texture') {
              logOutput(`your being says its ${wrapCmd(e)} feels ${wrapCmd(this.playersBeing.txtr)}.`); 
            } else if(e=='shape') {
              logOutput(`because your being is made of circles, it thinks its ${wrapCmd(e)} is ${wrapCmd(this.playersBeing.shape)}.`); 
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
            case forWord:
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
        `); // new Phaser.Display.Color().random().rgba
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
  addGameSpriteCircle(x, y, radius, color = getRandomColorInCat(), texture = 'circle') {
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
    this.color = Phaser.Display.Color.IntegerToColor(color);
    this.txtr = texture.includes('spiky') ? 'spiky':'smooth';
    this.shape = 'round'
  }
}

function getHealthyFood(being) {
  let healthy = []
  FOOD.getMatching('active', true).forEach(f => {
    console.log(f, )
      /*console.log(being.txtr == f.txtr, being.shape == f.shape, sameColorCategory(being.color, f.color), being.scale*being.heady.radius <= f.radius)
      console.log(being.txtr, f.txtr) 
      console.log(being.shape, f.shape) 
      console.log(getColorCategory(being.color), getColorCategory(f.color)) 
      console.log(being.scale*being.heady.radius, f.radius)
      console.log(being.heady)
      */
      if(being.txtr == f.txtr && being.shape == f.shape && sameColorCategory(being.color, f.color) && being.scale*being.heady.radius <= f.radius) {
        healthy.push(f);
      }
  })
  return healthy;
}