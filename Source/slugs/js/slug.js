class Slug extends Phaser.GameObjects.Container {
    constructor(scene=Scene2, x=0, y=0, radius=20, color=getRandomColorInCat()) {
      super(scene, x, y);
      this.setDataEnabled();
      this.data.values.color = color;
      this.color = color
      this.txtr = 'smooth';
      this.shape = 'round';
      let headyColor = this.color.clone().lighten((Math.min(0.2+Math.random(), 0.8))*50);
      let tailColor = this.color.clone().lighten((Math.min(0.1+Math.random(), 0.8))*30);
  
      let headyRadius = radius/1.5
      let tail0Radius = radius/1.3
      let tail1Radius = radius/2
  
      this.heady   = this.scene.addGameCircle(x, y, headyRadius, headyColor);
      this.torso   = this.scene.addGameCircleTextured(x-radius-headyRadius, y, radius, this.color);
      this.tail0 = this.scene.addGameCircle(x-radius-headyRadius-tail0Radius, y, tail0Radius, tailColor);
      this.tail1 = this.scene.addGameCircle(x-radius-headyRadius-tail0Radius-tail1Radius, y, tail1Radius, tailColor);
  
  
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
      this.scene.matter.applyForce(this.heady, {x: getRandomInclusive(-0.2, 0.2), y: getRandomInclusive(-0.2, 0.2)})
    }
  
    eat(foodType='any') {
      this.eating = true;
      if(RULES.length) {
        logOutput(`first, the being thinks of the ${wrapCmd('rules')} you gave it.`)
      }
      
      let rulesFood = [];
      
      FOOD_MATCHING = [ ];
      
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
            let food = '';
            if(r.ifColor) {
              food = COLORCATS_HR[getColorCategory(f.color)];
            }
            if(r.ifSize) {
              if(booleanString.includes('beings size')) {
                booleanString.replaceAll('beings size', `'beings size'`);
                food = (this.heady.radius*this.scale > f.radius - 5*this.scale || this.heady.radius*this.heady.scaleX < f.radius - 5*this.scale ? "beings size":"not same size" );
              } else{
                food = (this.heady.radius*this.heady.scaleX < f.radius ? 'bigger':'smaller' )
              }
            }
            if(r.ifTexture) {
              food = f.txtr;
            }
            console.log(booleanString, 'food var:', food);
            let evaluation = eval(booleanString);
            console.log(evaluation);
            if(evaluation && !r.avoid) {
              foodCurrentlySelected.push(foodSelected[i]);
            }
          }
          console.log(foodCurrentlySelected);
          foodSelected = foodCurrentlySelected;
        }
        FOOD_MATCHING = foodSelected;
      } else {
        logOutput(`none of the ${wrapCmd('rules')} tell your being what to eat, so it will try to eat anything!`)
        FOOD_MATCHING = FOOD.getMatching('active', true);
        
      }
      if(!FOOD_MATCHING.length) {
        logOutput(`there is no food item which matches your beings ${wrapCmd('rules')} close enough - try ${wrapCmd(editWord)}ing your ${wrapCmd('rules')} or moving your being closer :)`)
        this.eating = false;
        return
      }
      // having found our food stuff, move to it until you're close!
      this.closestMatch = findClosest(this.heady, FOOD_MATCHING);
      this.closestMatch.targeted = true;
      let rotationDirection = 0;
     
      let swimStates = [-20, 0, 20, 0];
      swimStates.forEach((e, i) => {swimStates[i] = Phaser.Math.DegToRad(e)})
      let waveIndex = 0;
  
      this.timer = 0;
      this.scene.events.on('update', function(time, delta) {
        if(this.eating && FOOD_MATCHING && this.heady.x && this.heady.y){
          let closestMatchNew = findClosest(this.heady, FOOD_MATCHING);
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
            // console.log('slugtimer')
            waveIndex = (waveIndex+1) % swimStates.length;
            this.timer -= 600;
          }
          FOOD_MATCHING.forEach((e, i) => {
            if(!e.active) {
              FOOD_MATCHING.splice(i, 1)
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