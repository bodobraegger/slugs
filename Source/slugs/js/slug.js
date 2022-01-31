class Slug extends Phaser.GameObjects.Container {
    constructor(scene=Scene2, x=0, y=0, radius=20, color=getRandomColorInCat(), render=true, player=true) {
      super(scene);
      this.color = color
      this.txtr = 'smooth';
      this.shape = 'round';
      this.name = this.scene.beingCounter++;
      this.plantLoop = false;
      let headyColor = this.color.clone().lighten((Math.min(0.2+Math.random(), 0.8))*50);
      let tailColor = this.color.clone().lighten((Math.min(0.1+Math.random(), 0.8))*30);
  
      let headyRadius = radius/1.4
      let tail0Radius = radius/1.7
      let tail1Radius = radius/2.4
  
      this.heady = this.scene.addGameCircle(x, y, headyRadius, headyColor);
      this.torso = this.scene.addGameCircle(x-radius-headyRadius, y, radius, this.color);
      this.tail0 = this.scene.addGameCircle(x-radius-headyRadius-tail0Radius, y, tail0Radius, tailColor);
      this.tail1 = this.scene.addGameCircle(x-radius-headyRadius-tail0Radius-tail1Radius, y, tail1Radius, tailColor);

      
      this.headyjoint  = this.scene.matter.add.joint(
        this.heady, this.torso, 
        2+(this.heady.radius+this.torso.radius)/2, 0.3, 
        {
          pointA: {x: -this.heady.radius/2, y: 0}, 
          pointB: {x: this.torso.radius/2, y: 0} }
      ); // , {pointA: {x: this.torso.radius/2, y: 0}}
  
      this.torsojoint  = this.scene.matter.add.joint(
        this.torso, this.tail0, 
        2+(this.torso.radius+this.tail0.radius)/2, 0.3,
        { pointA: {x: -this.torso.radius/2, y: 0}, 
          pointB: {x: this.tail0.radius/2, y: 0} }
      );
      this.tailjoint  = this.scene.matter.add.joint(
        this.tail0, this.tail1, 
        2+(this.tail0.radius+this.tail1.radius)/2, 0.3,
        { pointA: {x: -this.tail0.radius/2, y: 0}, 
          pointB: {x: this.tail1.radius/2, y: 0} }
        );
        
        this.jointsBody = [
          this.headyjoint,
          this.torsojoint,
          this.tailjoint
        ]
        this.joints = [...this.jointsBody]  
        this.joints.forEach(e => {
          e.originalLength = e.length;
        })
        
        this.bodyparts = [this.heady, this.torso, this.tail0, this.tail1]; //this.a1, this.a2, 
        this.bodyparts.forEach((e, i) => {

        e.setBounce(0.0)
      })
      this.list = this.bodyparts // + this.joints;
      this.alpha = 1;
      this.tint = color.color;
      this.setScale(1);
      this.body = this.torso.body;
      this.rulesParsed = [ ];

      this.food_matching = new Phaser.GameObjects.Group(this);

      // for movement
      this.swimStates = [-20, 0, 20, 0];
      this.swimStates.forEach((e, i) => {this.swimStates[i] = DegToRad(e)})
      this.speedMod = 1;
      this.waveIndex = 0;
      this.timer = 0;

      this.scene.events.on('postupdate', function(time, delta) {
        this.timer += delta;
        while(this.timer > 600/this.speedMod) {
          // console.debug('slugtimer')
          this.waveIndex = (this.waveIndex+1) % this.swimStates.length;
          this.timer -= 600/this.speedMod;
        }
      }, this);
      

      const callback = function(params)  {
        if(!(this.fleeing || this.eating) && this.scene.started) {
          let c = Between(0, 19);
          let player = ( this == this.scene.pb )
          let playerNotPassive = ( player && (this.alpha != 1 || this.hunter || this.scene.mutationObserver.lastLogged > Date.now() - 30 * 1000) )
          if(playerNotPassive) {
            return;
          }
          if(c < 10) {
            if(player) {
              startNewLogSegment();
              logInput(`your being roams around... maybe you could tell it what to do? try seeing how by typing ${wrapCmd('help')}!`)
              this.roam();
            } 
          } else if(c < 15) {
            if(player) {
              startNewLogSegment();
              logInput(`your being tries to eat as it feels hungry and you did not tell it what to do. to talk to your being, check out the ${wrapCmd('help')} command!`)
              this.eat()
            } else {
              this.eat('healthy');
            }
          } else if(c < 18) {
            if(player) {
              startNewLogSegment();
              logInput(`your being seems a bit bored... maybe you could tell it what to do? try seeing how by typing ${wrapCmd('help')}!`)
            }
            this.stop();
          }
        }
      }
      var timer = scene.time.addEvent({
        delay: Between(20, 30) * 1000,
        callback: callback,
        callbackScope: this,
        loop: true
      });
      this.moveRandomly();

      if(!render) {
        this.bodyparts.forEach(e=> {
          e.destroy();
        })
        this.scene.matter.world.removeConstraint(this.joints, true);
        this.joints = []
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
  
      for(let i = 0; i < this.joints.length; i++) {
        let j = this.joints[i];
        let diff = sX-1;
        j.length = (2+j.originalLength)*(1+diff*Math.PI/2);
        // if(j.length < 2+this.heady.radius*this.scale+this.torso.radius*this.scale)
        // j.length = 2+(this.bodyparts[i].radius*this.scale+this.bodyparts[i+1].radius*this.scale)/2
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
        console.debug(e.type, e.radius, e.scaleX)
        s += Math.PI * (e.radius*(e.scaleX))**2
      })
      return s;
    }
  
    moveRandomly() {
      this.scene.matter.applyForce(this.heady, {x: FloatBetween(-0.005, 0.005), y: FloatBetween(-0.0005, 0.0005)})
    }

    moveTo(target, speedMod = 1, draw=true) {
      this.speedMod = speedMod;
      let reachedDist = this.heady.displayWidth+20*this.scale;
      if(target instanceof Phaser.GameObjects.GameObject) {
        reachedDist = target.displayWidth + this.heady.displayWidth+20*this.scale;
      }
      
      let speed = this.torso.displayWidth/10 * speedMod;
      let targetToHeady = new Vector2(target).subtract(this.heady);
      let len = targetToHeady.length()
      if(draw) { drawVec(targetToHeady, this.heady, this.color.color, Math.min(this.heady.displayWidth, (this.heady.displayWidth+target.displayWidth)*30/len)) }
      
      let targetVec = velocityToTarget(this.heady, target);
      let distanceToTarget = Distance.BetweenPoints(this.heady, target)
      
      let vecTorsoHeady = velocityToTarget(this.torso, this.heady)
      let angleSlugTarget = Angle.ShortestBetween(RadToDeg(vecTorsoHeady.angle()), RadToDeg(targetVec.angle()));
      
      let tail0Vec = velocityFacing(this.tail0, speed/2); 
      let torsoVec = velocityFacing(this.torso, speed/2); 
      let headyVec = velocityFacing(this.heady, speed/2); 
      
      if(! this.rotationDirection) {
        if(angleSlugTarget > 0 && angleSlugTarget > 50) {
          this.rotationDirection = -1;
          // console.debug('rotating left')
        } else if(angleSlugTarget < 0 && angleSlugTarget < -50) {
          this.rotationDirection = 1;
          // console.debug('rotating right')
        }
      }
      
      let correctionAngle = DegToRad(40);
      // console.debug(Math.round(angleSlugTarget), this.rotationDirection)
      
      if((angleSlugTarget > 0 && angleSlugTarget < 70)||(angleSlugTarget < 0 && angleSlugTarget > -70)){
        headyVec.add(targetVec);
        this.torso.setVelocity(headyVec.x, headyVec.y);
        this.heady.setVelocity(headyVec.x, headyVec.y);
        // this.heady.applyForce(this.heady, this.heady, headyVec);
        this.heady.setAngle(RadToDeg(headyVec.angle()))
        
        
        if(distanceToTarget > 50) {
          // this.tail1.setVelocity(headyVec.x, headyVec.y);
          tail0Vec.rotate(this.swimStates[this.waveIndex]); // headyVec.mirror(vecTorsoHeady);
          this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
        }
      }
      else if(this.rotationDirection == -1 && (angleSlugTarget > 50 || angleSlugTarget < -50)) {
        // console.debug('counter clockwise')
        
        let torsoVec = headyVec.clone().setLength(0.25*speed);
        this.torso.setVelocity(torsoVec.x, torsoVec.y);
        headyVec.setAngle(this.heady.rotation - correctionAngle)
        tail0Vec.setAngle(this.tail0.rotation + correctionAngle);
        this.heady.setVelocity(headyVec.x, headyVec.y);
        this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
      }
      else if(this.rotationDirection == 1 && (angleSlugTarget > 50 || angleSlugTarget < -50)) {
        // console.debug('clockwise (right)')
        
        let torsoVec = headyVec.clone().setLength(0.25*speed);
        this.torso.setVelocity(torsoVec.x, torsoVec.y);
        headyVec.setAngle(this.heady.rotation + correctionAngle)
        tail0Vec.setAngle(this.tail0.rotation - correctionAngle);
        this.heady.setVelocity(headyVec.x, headyVec.y);
        this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
      }
      this.speedMod = 1;
    }
  
    eat(foodType='any') {
      this.stop()
      this.scene.triggerFoodUpdate = true;
      this.eating = true;
      if(this.rulesParsed.length) {
        logOutput(`first, the being thinks of the ${wrapCmd('rules')} you gave it.`)
      }
      let foodSelected = this.evaluateFoodRules()

      if(this.plantLoop && this == this.scene.pb) {
        logOutput(`it takes the ${wrapCmd('while routine')} into account :).`)
      }
      if(foodType == 'healthy') {
        foodSelected = []
        /*
        BEINGS.getMatching('active', true).forEach( b => {
          if(b!=this) {
            if(sameColorCategory(this.color, b.color) && this.heady.displayWidth > b.torso.displayWidth && this.shape == b.shape && this.txtr == b.txtr) {
              this.food_matching.add(b.torso)
            }
          }
        });
        */
       FRUIT.getMatching('active', true).forEach( f => {
          if(sameColorCategory(this.color, f.color) && this.heady.displayWidth > f.displayWidth && this.shape == f.shape && this.txtr == f.txtr) {
            foodSelected.push(f)
          }
        });

      }
      this.food_matching.clear()
      this.food_matching.addMultiple(foodSelected.filter(e => (e.displayWidth > this.heady.displayWidth/4 && e.displayWidth < this.heady.displayWidth*3)));

      // having found our food stuff, move to it until you're close!
      this.chosenFood = findClosest(this.heady, this.food_matching.getMatching('active', true));
      if(!(this.chosenFood) && this == this.scene.pb) {
        logOutput(`your being thinks there is no food that matches the rules you gave it :(. if you think your rules are ok, maybe you just have to try again in a second! if you are not sure, try typing the ${wrapCmd(deleteWord)} command to make your being forget a rule and try again :).`)
          this.scene.updateEdible();
          return;
      }
      if(this.chosenFood) {
        this.chosenFood.hunter = this;
      }
      
      this.rotationDirection = 0;
      

      this.scene.events.on('postupdate', function(time, delta) {
        try {
        if(this.eating && this.food_matching.getChildren('active', true).length){
          
          this.food_matching.getMatching('active', true).forEach((e, i) => {
            try {
              if(!e.active) {
                this.food_matching.remove(e);
              }
              if(this.plantLoop && this.chosenFood.group) {
                if(e.group != this.chosenFood.group) this.food_matching.remove(e);
              }
            } catch(error) {
              console.warn(error, 'this.chosenfood probably no longer exists!')
            }
          })
          if( !this.food_matching.getMatching('active', true).length) {
            let output = `your being is done with the food it saw.`
            if(playersBeing.plantLoop && this.chosenFood.group) {
              output += `<br>it tried all fruits off the plant which matched its rules!`
            }
            if(this == this.scene.pb) {
              logOutput(output);
            }
            this.stop();
            return;
          }
          let closestMatchNew = findClosest(this.heady, this.food_matching.getMatching('active', true));
          if(this.chosenFood.group) {
              if(this.chosenFood.group.getChildren('active', true).length && this.food_matching.getMatching('group', this.chosenFood.group).length) {
                while(closestMatchNew.group != this.chosenFood.group && !closestMatchNew.active) {
                  closestMatchNew = findClosest(this.heady, this.food_matching.getMatching('group', this.chosenFood.group));
                  // console.debug(closestMatchNew)
                }
              }
            }
            
            if(!this.chosenFood.active) {
              // console.debug('replacing closest match with', closestMatchNew)
              this.chosenFood.hunter = null
              this.chosenFood = closestMatchNew;
              this.chosenFood.hunter = this;
            }
            this.moveTo(this.chosenFood, 1);
            
            if(closestMatchNew && this.chosenFood != closestMatchNew) {
              if(Distance.BetweenPoints(this.heady, closestMatchNew) - Distance.BetweenPoints(this.heady, this.chosenFood) < -50*this.scale){
                this.chosenFood.hunter = null;
                // console.debug(closestMatchNew)
                this.chosenFood = closestMatchNew;
                this.chosenFood.hunter = this;
                this.rotationDirection = 0;
              } 
            }
            let plant = this.chosenFood.group;
            if(!closestMatchNew && plant && this.plantLoop) {
              this.food_matching.addMultiple(plant.getMatching('visible', true));
            }
          }
        } catch (error) {
          console.warn(error, 'error in slug.eat()')
          this.stop()
        }
        }, this);
    }
    evaluateFoodRules(logging = true) {
      let foodSelected = FRUIT.getMatching('active', true);
      let rulesFoodPositive = this.rulesParsed.filter(e => e.action == 'eat');
      if(rulesFoodPositive.length) {
        if(logging) logOutput(`it remembers the following food ${wrapCmd('rules')} about things it should eat:`)
        
        for(let i = 0; i < rulesFoodPositive.length; i++) {
          let foodCurrentlySelected = [ ];
          let r = rulesFoodPositive[i]; 
          let booleanExpr = r.booleanExpr;
          let booleanString = booleanExpr.join(' '); // .splice(1, 0, '(').push(')')
          if(logging) logOutput(`${i+1}. ${wrapCmd(booleanString.replaceAll("'", ""))} ${i<rulesFoodPositive.length-1 ? 'and' : ''}`)
          booleanString = booleanString.replaceAll(notEqualWord, '!=').replaceAll(equalWord, '==').replaceAll(andWord, '&&').replaceAll(` ${orWord}`, ` ||`);
          if(booleanString.includes("beings ")) {
            ATTRIBUTES.forEach( (e,i) => {
              if(booleanString.includes(`beings ${e}`)) {
                // console.debug(booleanString, e)
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
            let fruit = '';
            if(r.ifColor) {
              fruit = COLORCATS_HR[getColorCategory(f.color)];
            }
            if(r.ifSize) {
              if(booleanString.includes(`beings size`)) {
                booleanString.replaceAll(`beings size`, `"beings size"`);
                fruit = (this.heady.displayWidth > f.displayWidth - 5*this.scale || this.heady.displayWidth < f.displayWidth - 5*this.scale ? "beings size":"not same size" );
              } else{
                fruit = (this.heady.displayWidth < f.displayWidth ? 'bigger_than_head':'smaller_than_head' )
              }
            }
            if(r.ifTexture) {
              fruit = f.txtr;
            }
            // console.debug(booleanString, 'fruit var:', fruit);
            try {
              let evaluation = eval(booleanString);
              // console.debug(evaluation);
              if(evaluation) {
                foodCurrentlySelected.push(foodSelected[i]);
              }
            } catch(error) {
              console.info(error, booleanString)
            }
          }
          // console.debug(foodCurrentlySelected);
          foodSelected = foodCurrentlySelected;
        }
        // add to foodmatching outside of condition
      } 
      if(this == this.scene.pb && !(rulesFoodPositive.length)) {
        if(logging) logOutput(`none of the ${wrapCmd('rules')} tell your being what to ${wrapCmd('eat')}, so it will try to ${wrapCmd('eat')} anything! perhaps you should try to give it a rule to make sure it eats good food. try using the ${wrapCmd('help if')} commands :)`)
      }
      return foodSelected;
    }
    roam() {
      if(!(this.eating || this.fleeing)) {
        this.stop()
        this.roaming = true;
        this.roamingTarget = this.getRandomPointClose(findClosest(this.torso, FRUIT.getMatching('active', true)) );
        const callback = function(params)  {
          if(!(this.fleeing || this.eating || this.alpha != 1)) {
            this.roamingTarget = this.getRandomPointClose(this.roamingTarget)
            // console.debug('setting new roaming target: ', this.roamingTarget)
            this.roaming = true;
          }
        }
        this.scene.events.on('postupdate', function(time, delta) {
          if(this.roaming && !(this.fleeing || this.eating || this.alpha != 1)){
            // console.debug(this.rotationDirection)
            // console.debug(this.hunterHeady, dist)
            let target = this.roamingTarget;
            this.moveTo(target, 0.5);
            let distSq = Distance.BetweenPointsSquared(this.heady, this.roamingTarget);
            if(distSq < this.heady.displayWidth**2 * 4) {
              this.roaming = false;
              let delay = Between(5, 10) * 1000
              var timer = this.scene.time.delayedCall(delay, callback, undefined, this);  // delay in ms
            }
          }
        }, this);
      }
    }

    getRandomPointClose(point) {
      let r = new Vector2();
      let x, y;
      if(point) {
        x = Between(
          Between(point.x-800*this.torso.displayWidth/30, point.x-400*this.torso.displayWidth/30), 
          Between(point.x+400*this.torso.displayWidth/30, point.x+800*this.torso.displayWidth/30)
        );
        y = Between(
          Between(point.y-800*this.torso.displayWidth/30, point.y-400*this.torso.displayWidth/30), 
          Between(point.y+400*this.torso.displayWidth/30, point.y+800*this.torso.displayWidth/30)
        );
      }
      else {
        x = Between(this.scene.xBorderLeft, this.scene.xBorderRight);
        y = Between(this.scene.yBorderLow, this.scene.yBorderHigh);
      }
      r = {x, y};
      return r;
      
    }
  
    flee() {
      let thisHunterTemp = this.hunter;
      this.stop();
      this.hunter = thisHunterTemp;
      let output = ``;
      this.rotationDirection = 0;  
      this.timer = 0;
      this.fleeing = 0;
      let enemyHeadys = []
      let enemyHeadyPointers = [];
      if(!(this.rulesParsed.filter(e => e.action == 'flee').length)) {
        ENEMIES.getMatching('active', true).forEach(e => {
          enemyHeadyPointers.push({h: e.heady, e});
          enemyHeadys.push(e.heady);
        })
        this.hunterHeady = findClosest(this.heady, enemyHeadys);
        enemyHeadyPointers.forEach(ep => {
          if(ep.h == this.hunterHeady) {
            this.hunter = ep.e;
          }
        })
      } else {
        if(this.hunter) {
          this.hunterHeady = this.hunter.heady;
        } else {
          output += `it does not think it is being hunted right now :).`
          return output;
        }
      }
      
      let dist = Distance.BetweenPoints(this.heady, this.hunterHeady)
      if(dist > this.hunter.pursuitDistance) {
        output += `it thinks there are no angry creatures in reach :).`
        return output;
      } else {
        output += `<u class='beingscolor' style='filter: invert(1);'>it tries to flee!</u>`
      }
      this.fleeing = true
      this.scene.events.on('postupdate',function(time, delta) { 
        if(this.fleeing) {
          if(this.hunter && dist < this.hunter.pursuitDistance){
            // console.debug(this.rotationDirection)
            // console.debug(this.hunterHeady, dist)
            let vecFromEnemy = new Vector2(this.heady).subtract(this.hunterHeady);
            dist = vecFromEnemy.length();
            if( !ENEMIES.getMatching('active', true).length) {
              let output = `your being does not think there are harmful creatures nearby anymore. it will stop trying to flee!`
              if(this == this.scene.pb) {
                logOutput(output);
              }
              this.stop();
              return;
            }
            let inverse = this.color.clone().setTo(255-this.color.r, 255-this.color.g, 255-this.color.b).color
            drawVec(vecFromEnemy, this.hunterHeady,inverse, Math.min(this.heady.displayWidth, (this.heady.displayWidth+this.hunter.torso.displayWidth)*30/dist + this.heady.displayWidth/4))
            this.moveTo(vecFromEnemy, 3);
          }
          else {
            let output = `it thinks it far enough from the creature it tried to flee from now, so it stops fleeing ...`
            if(this == this.scene.pb) {
              logOutput(output)
            }
            try {
              console.debug(this.hunter, dist, this.hunter.pursuitDistance)
              if(this.hunterHeady == this.hunter.heady) this.hunter.stop();
            } catch(error) {
              console.debug(error);
            }
            this.stop();
          }
        }
      }, this);

      return output;
    }

    stop() {
      this.eating = false;
      this.fleeing = false;
      this.roaming = false;
      if(this.chosenFood) {
        this.chosenFood.hunter = null;
        this.chosenFood = null;
      }
      this.hunterHeady = null;
      this.hunter = null;
      
          
    }


    addRule(ruleString) {
      let ifColor = false;
      let ifTexture = false;
      let ifSize = false;
      let ifShape = false;
      let r = ruleString.split(" ");
      let type = r.at(1);
      let action = r.at(-1);
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
      this.rulesParsed.push({
        type,
        booleanExpr,
        ifColor,
        ifTexture,
        ifSize,
        ifShape,
        action,
      });
      RULES.push(ruleString);
    }

    saturate(on=true) {
      if(on) {
        this.bodyparts.forEach(e => {
          if(e instanceof GameObjects.Arc) {
            e.fillColor = e.color.color;
          } else if(e instanceof GameObjects.Sprite) {
            e.setTint(e.color.color)
          }
          //e.resetPipeline();
        })
      } else {
        this.bodyparts.forEach(e => {
          let greyed = e.color.clone().gray( (e.color.r+e.color.b+e.color.b)/3 )
          // ALTERNATIVE: 
          // let greyed = e.color.clone().desaturate(75).color
          if(e instanceof GameObjects.Arc) {
            e.fillColor = greyed.color;
          } else if(e instanceof GameObjects.Sprite) {
            e.setTint(greyed.color)
          }
          //e.setPipeline(grayscalePipeline);
        })
      }
    }
    someVisible() {
      this.bodyparts.some((f, i) => {
        let c = this.scene.cameras.main;
        let mp = c.midPoint;
        let viewRec = new Phaser.Geom.Rectangle(mp.x-c.displayWidth/2, mp.y-c.displayHeight/2, c.displayWidth, c.displayHeight);
        // console.debug(viewRec)
        if(Phaser.Geom.Rectangle.Overlaps(viewRec,f.getBounds())) {
          f.visible = true;
          this.visible = true;
          return this.visible;
          // f.setActive(true);
        }
      });
      return this.visible;
    }

}