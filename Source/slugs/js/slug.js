class Slug extends Phaser.GameObjects.Container {
    constructor(scene=Scene2, x=0, y=0, radius=20, color=getRandomColorInCat()) {
      super(scene, x, y);
      this.setDataEnabled();
      this.data.values.color = color;
      this.color = color
      this.txtr = 'smooth';
      this.shape = 'round';
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
        2+(this.heady.radius+this.torso.radius)/2, 0.5, 
        {
          pointA: {x: -this.heady.radius/2, y: 0}, 
          pointB: {x: this.torso.radius/2, y: 0} }
      ); // , {pointA: {x: this.torso.radius/2, y: 0}}
  
      this.torsojoint  = this.scene.matter.add.joint(
        this.torso, this.tail0, 
        2+(this.torso.radius+this.tail0.radius)/2, 0.5,
        { pointA: {x: -this.torso.radius/2, y: 0}, 
          pointB: {x: this.tail0.radius/2, y: 0} }
      );
      this.tailjoint  = this.scene.matter.add.joint(
        this.tail0, this.tail1, 
        2+(this.tail0.radius+this.tail1.radius)/2, 0.5,
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
      this.rulesFood = [ ];

      // for movement
      this.swimStates = [-20, 0, 20, 0];
      this.swimStates.forEach((e, i) => {this.swimStates[i] = DegToRad(e)})
      this.waveIndex = 0;
      this.timer = 0;
  
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
  
      for(let i = 0; i < this.jointsBody.length; i++) {
        let j = this.jointsBody[i];
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
      this.scene.matter.applyForce(this.heady, {x: FloatBetween(-0.2, 0.2), y: FloatBetween(-0.2, 0.2)})
    }
  
    eat(foodType='any') {
      stop()
      this.scene.triggerFoodUpdate = true;
      this.eating = true;
      if(RULES.length) {
        logOutput(`first, the being thinks of the ${wrapCmd('rules')} you gave it.`)
      }
      let foodSelected = FOOD.getMatching('active', true);

      if(this.rulesFood.length) {
          logOutput(`it remembers the following food ${wrapCmd('rules')}:`)
        
        for(let i = 0; i < this.rulesFood.length; i++) {
          let foodCurrentlySelected = [ ];
          let r = this.rulesFood[i]; 
          let booleanExpr = r.booleanExpr;
          let booleanString = booleanExpr.join(' '); // .splice(1, 0, '(').push(')')
            logOutput(`${i+1}. ${wrapCmd(booleanString.replaceAll("'", ""))} ${i<this.rulesFood.length-1 ? 'and' : ''}`)
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
        // add to foodmatching outside of condition
      } else {
          logOutput(`none of the ${wrapCmd('rules')} tell your being what to eat, so it will try to eat anything!`)
        // FOOD_MATCHING = FOOD.getMatching('active', true);
        
      }
      FOOD_MATCHING.clear()
      FOOD_MATCHING.addMultiple(foodSelected.filter(e => (e.displayWidth > this.heady.displayWidth/4 && e.displayWidth < this.heady.displayWidth*3)));

      // having found our food stuff, move to it until you're close!
      this.chosenFood = findClosest(this.heady, FOOD_MATCHING.getMatching('active', true));
      this.chosenFood.targeted = true;
      let plant = this.chosenFood.group;
      this.rotationDirection = 0;
     
      this.scene.events.on('postupdate', function(time, delta) {
        if(this.eating && FOOD_MATCHING.countActive()){
          FOOD_MATCHING.getMatching('active', true).forEach((e, i) => {
            if(!e.active) {
              FOOD_MATCHING.remove(e);
            }
            if(this.plantLoop && this.chosenFood.group && e.group != this.chosenFood.group) {
              FOOD_MATCHING.remove(e);
            }
          })
          if( !FOOD_MATCHING.getMatching('active', true).length) {
            let output = `your being is done with the food it saw.`
            if(playersBeing.plantLoop && this.chosenFood.group) {
              output += `<br>it tried all fruits off the plant which matched its rules!`
            }
            logOutput(output);
            this.stop();
            return;
          }
          let closestMatchNew = findClosest(this.heady, FOOD_MATCHING.getMatching('active', true));
          if(this.chosenFood.group) {
            if(this.chosenFood.group.countActive() && FOOD_MATCHING.getMatching('group', this.chosenFood.group).length) {
              while(closestMatchNew.group != this.chosenFood.group && !closestMatchNew.active) {
                closestMatchNew = findClosest(this.heady, FOOD_MATCHING.getMatching('group', this.chosenFood.group));
                console.log(closestMatchNew)
              }
            }
          }
          
          if(!this.chosenFood.active) {
            this.chosenFood.targeted = false;
            console.log('replacing closest match with', closestMatchNew)
            this.chosenFood = closestMatchNew;
            this.chosenFood.targeted = true;
          }
          let targetToHeady = new Vector2(this.chosenFood).subtract(this.heady);
          let len = targetToHeady.length()
          drawVec(targetToHeady, this.heady, this.color.color, Math.min(this.heady.displayWidth, (this.heady.displayWidth+this.chosenFood.displayWidth)*30/len))
          // console.log(this.chosenFood)
          
          let target = velocityToTarget(this.heady, this.chosenFood);
          let distanceToFood = Distance.BetweenPoints(this.heady, this.chosenFood)
  
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
  
          
          if(! this.rotationDirection) {
            if(angleSlugTarget > 0 && angleSlugTarget > 50) {
              this.rotationDirection = -1;
              console.log('rotating left')
            } else if(angleSlugTarget < 0 && angleSlugTarget < -50) {
              this.rotationDirection = 1;
              console.log('rotating right')
            }
          }
  
          let correctionAngle = DegToRad(40);
          // console.log(Math.round(angleSlugTarget), this.rotationDirection)
          
          if((angleSlugTarget > 0 && angleSlugTarget < 70)||(angleSlugTarget < 0 && angleSlugTarget > -70)){
            headyVec.add(target);
            this.torso.setVelocity(headyVec.x, headyVec.y);
            this.heady.setVelocity(headyVec.x, headyVec.y);
            // this.heady.applyForce(this.heady, this.heady, headyVec);
            this.heady.setAngle(RadToDeg(headyVec.angle()))
            
            
            if(distanceToFood > 50) {
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
            // headyVec.add(target);
            this.heady.setVelocity(headyVec.x, headyVec.y);
            this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
          }
          else if(this.rotationDirection == 1 && (angleSlugTarget > 50 || angleSlugTarget < -50)) {
            // console.log('clockwise (right)')
            
            let torsoVec = headyVec.clone().setLength(0.25*speed);
            this.torso.setVelocity(torsoVec.x, torsoVec.y);
            headyVec.setAngle(this.heady.rotation + correctionAngle)
            tail0Vec.setAngle(this.tail0.rotation - correctionAngle);
            // headyVec.add(target);
            this.heady.setVelocity(headyVec.x, headyVec.y);
            this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
          }
          
          
          if(closestMatchNew && this.chosenFood != closestMatchNew) {
            let closer = Distance.BetweenPoints(this.heady, closestMatchNew) - distanceToFood;
            if( closer > 50){
              
              console.log(closestMatchNew)
              closestMatchNew.targeted = true;
              this.chosenFood.targeted = false;
              this.chosenFood = closestMatchNew;
              this.rotationDirection = 0;
              console.log('target switched')
              this.chosenFood = this.chosenFood;
            } 
          }
          plant = this.chosenFood.group;
          if(!closestMatchNew && plant && this.plantLoop) {
            FOOD_MATCHING.addMultiple(plant.getMatching('visible', true));
          }
          this.timer += delta;
          while(this.timer > 600) {
            // console.log('slugtimer')
            this.waveIndex = (this.waveIndex+1) % this.swimStates.length;
            this.timer -= 600;
          }
        }
      }, this);
    }
  
    stop() {
      this.eating = false;
      this.fleeing = false;
      // FOOD.getMatching('active', true).forEach(e=> {
      //  e.targeted = false;
      // })
      if(this.chosenFood) {
        this.chosenFood.targeted = false;
        this.chosenFood = null;
      }
      if(this.closestEnemy) {
        this.closestEnemy = null;
      }
  
    }

    flee() {
      stop();
      this.rotationDirection = 0;  
      this.timer = 0;
      this.fleeing = 0;
      this.closestEnemy = findClosest(this.heady, ENEMIES.getMatching('active', true)).heady;
      
      let dist = Distance.BetweenPoints(this.heady, this.closestEnemy)
      this.fleeing = true
      this.scene.events.on('postupdate', function(time, delta) {
        if(this.fleeing && ENEMIES.countActive() && dist < 900 * this.scale){
          console.log(this.rotationDirection)
          console.log(this.closestEnemy, dist)
          dist = Distance.BetweenPoints(this.heady, this.closestEnemy)
          if( !ENEMIES.getMatching('active', true).length) {
            let output = `your being does not see any harmful creatures :). it will stop trying to flee!`
            logOutput(output);
            this.stop();
            return;
          }

          let targetToHeady = new Vector2(this.heady).subtract(this.closestEnemy);
          let len = targetToHeady.length()
          drawVec(targetToHeady, this.heady, 0xFFFFFF, Math.min(this.heady.displayWidth, (this.heady.displayWidth+this.closestEnemy.displayWidth)*30/len), 0.5)
          // console.log(this.closestEnemy)
          
          let target = velocityToTarget(this.closestEnemy, this.heady);
  
          let vecTorsoHeady = velocityToTarget(this.torso, this.heady)
          let angleSlugTarget = Angle.ShortestBetween(RadToDeg(vecTorsoHeady.angle()), RadToDeg(target.angle()));
          
          let speed = 8*this.scale;
    
          let tail1Vec = velocityFacing(this.tail1, speed/2); 
          let tail0Vec = velocityFacing(this.tail0, speed/2); 
          let torsoVec = velocityFacing(this.torso, speed/2); 
          let headyVec = velocityFacing(this.heady, speed/2); 
          // this.tail1.setVelocity(tail1Vec.x, tail1Vec.y)
          // this.tail0.setVelocity(velocityFacing(this.tail0, speed).x, velocityFacing(this.tail0, 1).y)
          // this.torso.setVelocity(velocityFacing(this.torso, speed).x, velocityFacing(this.torso, 1).y)
          // this.heady.setVelocity(headyVec.x, headyVec.y)
  
          
          if(!this.rotationDirection) {
            if(angleSlugTarget > 0 && angleSlugTarget > 50) {
              this.rotationDirection = -1;
              console.log('rotating left')
            } else if(angleSlugTarget < 0 && angleSlugTarget < -50) {
              this.rotationDirection = 1;
              console.log('rotating right')
            }
          }
  
          let correctionAngle = DegToRad(40);
          // console.log(Math.round(angleSlugTarget), this.rotationDirection)
          
          if((angleSlugTarget > 0 && angleSlugTarget < 70)||(angleSlugTarget < 0 && angleSlugTarget > -70)){
            headyVec.add(target);
            this.torso.setVelocity(headyVec.x, headyVec.y);
            this.heady.setVelocity(headyVec.x, headyVec.y);
            // this.heady.applyForce(this.heady, this.heady, headyVec);
            this.heady.setAngle(RadToDeg(headyVec.angle()))
            
          }
          else if(this.rotationDirection == -1 && (angleSlugTarget > 50 || angleSlugTarget < -50)) {
            // console.log('counter clockwise')
            
            let torsoVec = headyVec.clone().setLength(0.25*speed);
            this.torso.setVelocity(torsoVec.x, torsoVec.y);
            headyVec.setAngle(this.heady.rotation - correctionAngle)
            tail0Vec.setAngle(this.tail0.rotation + correctionAngle);
            // headyVec.add(target);
            this.heady.setVelocity(headyVec.x, headyVec.y);
            this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
          }
          else if(this.rotationDirection == 1 && (angleSlugTarget > 50 || angleSlugTarget < -50)) {
            // console.log('clockwise (right)')
            
            let torsoVec = headyVec.clone().setLength(0.25*speed);
            this.torso.setVelocity(torsoVec.x, torsoVec.y);
            headyVec.setAngle(this.heady.rotation + correctionAngle)
            tail0Vec.setAngle(this.tail0.rotation - correctionAngle);
            // headyVec.add(target);
            this.heady.setVelocity(headyVec.x, headyVec.y);
            this.tail0.setVelocity(tail0Vec.x, tail0Vec.y);
          }
          // drawVec(headyVec.setLength(100), this.heady, 0xF00000, Math.min(this.heady.displayWidth, (this.heady.displayWidth+this.closestEnemy.displayWidth)*30/len), 0.5)
          this.timer += delta;
          while(this.timer > 300) {
            // console.log('slugtimer')
            this.waveIndex = (this.waveIndex+1) % this.swimStates.length;
            this.timer -= 300;
          }
        }
      }, this);
    }

    saturate(on=true) {
      const grayscalePipeline = this.scene.renderer.pipelines.get('Grayscale');
      console.log(on)
      if(on) {
        this.bodyparts.forEach(e => {
          e.resetPipeline();
        })
      } else {
        console.log(grayscalePipeline)
        this.bodyparts.forEach(e => {
          e.setPipeline(grayscalePipeline);
        })
      }
    }

}