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
        this.headyjoint.angularStiffness = 0.2;
        
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
          // console.log('slugtimer')
          this.waveIndex = (this.waveIndex+1) % this.swimStates.length;
          this.timer -= 600/this.speedMod;
        }
      }, this);
      

      const callback = function(params)  {
        if(!(this.fleeing || this.eating)) {
          let c = Between(0, 19);
          let player = ( this == this.scene.pb )
          let playerNotPassive = ( player && (this.alpha != 1 || this.hunter) )
          if(playerNotPassive) {
            return;
          }
          if(c < 10) {
            if(player) {
              logInput(`your being roams around... maybe you could tell it what to do? try seeing how by typing ${wrapCmd('help')}!`)
              this.roam();
            } 
          } else if(c < 15) {
            if(player) {
              logInput(`your being tries to eat as it feels hungry and you did not tell it what to do. to talk to your being, check out the ${wrapCmd('help')} command!`)
              this.eat()
            } else {
              this.eat('healthy');
            }
          } else if(c < 18) {
            if(player) {
              logInput(`your being seems a bit bored... maybe you could tell it what to do? try seeing how by typing ${wrapCmd('help')}!`)
            }
            this.stop();
          }
        }
      }
      this.roam();
      var timer = scene.time.addEvent({
        delay: Between(10, 20) * 1000,
        callback: callback,
        callbackScope: this,
        loop: true
      });
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
        console.log(e.type, e.radius, e.scaleX)
        s += Math.PI * (e.radius*(e.scaleX))**2
      })
      return s;
    }
  
    moveRandomly() {
      this.scene.matter.applyForce(this.heady, {x: FloatBetween(-0.05, 0.05), y: FloatBetween(-0.05, 0.05)})
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
          // console.log('rotating left')
        } else if(angleSlugTarget < 0 && angleSlugTarget < -50) {
          this.rotationDirection = 1;
          // console.log('rotating right')
        }
      }
      
      let correctionAngle = DegToRad(40);
      // console.log(Math.round(angleSlugTarget), this.rotationDirection)
      
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
        // console.log('counter clockwise')
        
        let torsoVec = headyVec.clone().setLength(0.25*speed);
        this.torso.setVelocity(torsoVec.x, torsoVec.y);
        headyVec.setAngle(this.heady.rotation - correctionAngle)
        tail0Vec.setAngle(this.tail0.rotation + correctionAngle);
        this.heady.setVelocity(headyVec.x, headyVec.y);
        this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
      }
      else if(this.rotationDirection == 1 && (angleSlugTarget > 50 || angleSlugTarget < -50)) {
        // console.log('clockwise (right)')
        
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
      if(RULES.length) {
        logOutput(`first, the being thinks of the ${wrapCmd('rules')} you gave it.`)
      }
      let foodSelected = FRUIT.getMatching('active', true);

      let rulesFood = this.rulesParsed.filter(e => e.action == 'eat')
      if(rulesFood.length) {
        logOutput(`it remembers the following food ${wrapCmd('rules')}:`)
        
        for(let i = 0; i < rulesFood.length; i++) {
          let foodCurrentlySelected = [ ];
          let r = rulesFood[i]; 
          let booleanExpr = r.booleanExpr;
          let booleanString = booleanExpr.join(' '); // .splice(1, 0, '(').push(')')
          logOutput(`${i+1}. ${wrapCmd(booleanString.replaceAll("'", ""))} ${i<rulesFood.length-1 ? 'and' : ''}`)
          booleanString = booleanString.replaceAll(equalWord, '==').replaceAll(andWord, '&&').replaceAll(` ${orWord}`, ` ||`);
          if(booleanString.includes("being's ")) {
            ATTRIBUTES.forEach( (e,i) => {
              if(booleanString.includes(`being's ${e}`)) {
                // console.log(booleanString, e)
                let replacement = playersBeing[e];
                if(replacement instanceof Color) {
                  replacement = COLORCATS_HR[getColorCategory(replacement)];
                }
                booleanString = booleanString.replaceAll(`being's ${e}`, `'${replacement}'`)
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
              if(booleanString.includes(`being's size`)) {
                booleanString.replaceAll(`being's size`, `"being's size"`);
                fruit = (this.heady.displayWidth > f.displayWidth - 5*this.scale || this.heady.displayWidth < f.displayWidth - 5*this.scale ? "being's size":"not same size" );
              } else{
                fruit = (this.heady.displayWidth < f.displayWidth ? 'bigger':'smaller' )
              }
            }
            if(r.ifTexture) {
              fruit = f.txtr;
            }
            // console.log(booleanString, 'fruit var:', fruit);
            let evaluation = eval(booleanString);
            // console.log(evaluation);
            if(evaluation) {
              foodCurrentlySelected.push(foodSelected[i]);
            }
          }
          // console.log(foodCurrentlySelected);
          foodSelected = foodCurrentlySelected;
        }
        // add to foodmatching outside of condition
      } else {
        if(this == this.scene.pb) {
          logOutput(`none of the ${wrapCmd('rules')} tell your being what to eat, so it will try to eat anything!`)
        }
      }
      this.food_matching.clear()
      this.food_matching.addMultiple(foodSelected.filter(e => (e.displayWidth > this.heady.displayWidth/4 && e.displayWidth < this.heady.displayWidth*3)));

      // having found our food stuff, move to it until you're close!
      this.chosenFood = findClosest(this.heady, this.food_matching.getMatching('active', true));
      
      this.rotationDirection = 0;
      
      if(foodType == 'healthy') {
        this.food_matching.clear();
        BEINGS.getMatching('active', true).forEach( b => {
          if(b!=this) {
            if(sameColorCategory(this.color, b.color) && this.heady.displayWidth > b.torso.displayWidth && this.shape == b.shape && this.txtr == b.txtr) {
              this.food_matching.add(b.torso)
            }
          }
        });
        FRUIT.getMatching('active', true).forEach( f => {
          if(sameColorCategory(this.color, f.color) && this.heady.displayWidth > f.displayWidth && this.shape == f.shape && this.txtr == f.txtr) {
            this.food_matching.add(f)
          }
        });

      }

      this.scene.events.on('postupdate', function(time, delta) {
        if(this.eating && this.food_matching.countActive()){
          this.food_matching.getMatching('active', true).forEach((e, i) => {
            if(!e.active) {
              this.food_matching.remove(e);
            }
            if(this.plantLoop && this.chosenFood.group && e.group != this.chosenFood.group) {
              this.food_matching.remove(e);
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
            if(this.chosenFood.group.countActive() && this.food_matching.getMatching('group', this.chosenFood.group).length) {
              while(closestMatchNew.group != this.chosenFood.group && !closestMatchNew.active) {
                closestMatchNew = findClosest(this.heady, this.food_matching.getMatching('group', this.chosenFood.group));
                // console.log(closestMatchNew)
              }
            }
          }
          
          if(!this.chosenFood.active) {
            // console.log('replacing closest match with', closestMatchNew)
            this.chosenFood = closestMatchNew;
          }
          this.moveTo(this.chosenFood, 1);

          if(closestMatchNew && this.chosenFood != closestMatchNew) {
            if(Distance.BetweenPoints(this.heady, closestMatchNew) - Distance.BetweenPoints(this.heady, this.chosenFood) < -50*this.scale){
              
              // console.log(closestMatchNew)
              this.chosenFood = closestMatchNew;
              this.rotationDirection = 0;
              // console.log('target switched')
              this.chosenFood = this.chosenFood;
            } 
          }
          let plant = this.chosenFood.group;
          if(!closestMatchNew && plant && this.plantLoop) {
            this.food_matching.addMultiple(plant.getMatching('visible', true));
          }
        }
      }, this);
    }
    roam() {
      this.roaming = true;
      this.roamingTarget = this.getRandomPointClose(this.torso);
      const callback = function(params)  {
        this.roamingTarget = this.getRandomPointClose(this.roamingTarget)
        // console.log('setting new roaming target: ', this.roamingTarget)
        this.roaming = true;
      }
      this.scene.events.on('postupdate', function(time, delta) {
        if(this.roaming && !(this.fleeing || this.eating || this.alpha != 1)){
          // console.log(this.rotationDirection)
          // console.log(this.hunterHeady, dist)
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
      this.stop();
      let output = ``;
      this.rotationDirection = 0;  
      this.timer = 0;
      this.fleeing = 0;
      if(!this.hunter) {
        this.hunterHeady = findClosest(this.heady, ENEMIES.getMatching('active', true)).heady;
      } else {
        this.hunterHeady = this.hunter.heady;
      }
      
      let dist = Distance.BetweenPoints(this.heady, this.hunterHeady)
      if(dist > 900 * this.displayWidth/40) {
        output += `it does not see any harmful creature nearby :).`
        return output;
      } else {
        output += `it tries to flee from the angry creature!`
      }
      this.fleeing = true
      this.scene.events.on('postupdate', function(time, delta) {
        if(this.fleeing && ENEMIES.countActive() && dist < 900 * this.displayWidth/40){
          // console.log(this.rotationDirection)
          // console.log(this.hunterHeady, dist)
          dist = Distance.BetweenPoints(this.heady, this.hunterHeady)
          if( !ENEMIES.getMatching('active', true).length) {
            let output = `your being does not see any harmful creatures :). it will stop trying to flee!`
            if(this == this.scene.pb) {
              logOutput(output);
            }
            this.stop();
            return;
          }

          let target = new Vector2(this.heady).subtract(this.hunterHeady);
          this.moveTo(target, 2);
        }
        else {
          this.stop();
          let output = `it thinks it is far away enough now...`
          if(this == this.scene.pb) {
            logOutput(output)
          }
        }
      }, this);

      return output;
    }

    stop() {
      this.eating = false;
      this.fleeing = false;
      this.roaming = false;
      let delay = 15 * 1000;
      var timer = this.scene.time.delayedCall(delay, () => this.roam(), undefined, this);  // delay in ms

      if(this.chosenFood) {
        this.chosenFood = null;
      }
      if(this.hunterHeady) {
        this.hunterHeady = null;
      }
      
          
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
      const grayscalePipeline = this.scene.renderer.pipelines.get('Grayscale');
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

}