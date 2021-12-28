class Snake extends Phaser.GameObjects.Container {
    constructor(scene=Scene2, x=0, y=0, radius=20, color=getRandomColorInCat()) {
      super(scene, x, y);
      this.setDataEnabled();
      this.data.values.color = color;
      this.color = color
      this.txtr = 'smooth';
      this.shape = 'round';
      this.plantLoop = false;
      let headyColor = getRandomColorInCat().lighten((Math.min(0.2+Math.random(), 0.8))*50);
      let tailColor = getRandomColorInCat().lighten((Math.min(0.1+Math.random(), 0.8))*30);
  
      let headyRadius = radius/1.4
      let tail0Radius = radius/1.7
      let tail1Radius = radius/2.4
  
      this.heady   = this.scene.addGameCircle(x, y, headyRadius, headyColor);
      this.torso   = this.scene.addGameCircleTextured(x-radius-headyRadius, y, radius, this.color);
      this.tail0 = this.scene.addGameCircle(x-radius-headyRadius-tail0Radius, y, tail0Radius, tailColor);
      this.tail1 = this.scene.addGameCircle(x-radius-headyRadius-tail0Radius-tail1Radius, y, tail1Radius, tailColor);
  
  
      this.headyjoint  = this.scene.matter.add.joint(
        this.heady, this.torso, 
        2+(this.heady.radius+this.torso.radius)/2, 0.5, 
        {
          pointA: {x: -this.heady.radius/2, y: 0}, 
          pointB: {x: this.torso.radius/2, y: 0} }
      ); // , {pointA: {x: this.torso.radius/2, y: 0}}
  
      playersBeing.bodyparts.forEach(limb => {
        this.heady.setOnCollideWith(limb, pair => {
          console.log('snake colliding with', limb, pair)
          if(this.heady.displayWidth > playersBeing.torso.displayWidth) {
            playersBeing.setAlpha(0.2)
            playersBeing.saturate(false);
          } else {
            console.log(`phew, your being is lucky it is too large to be eaten!`)
          }
          this.eating = false;
        });

      });

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
      }
  
    }
  
    getMass() {
      let m = 0;
      this.list.forEach(e => {
        m += e.body.mass;
      })
      return m;
  
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
      // having found our food stuff, move to it until you're close!
      this.eating = true
      playersBeing.torso.targeted = true;
      let rotationDirection = 0;
     
      let swimStates = [-20, 0, 20, 0];
      swimStates.forEach((e, i) => {swimStates[i] = DegToRad(e)})
      let waveIndex = 0;
  
      this.timer = 0;
      this.scene.events.on('postupdate', function(time, delta) {
        if(this.eating && playersBeing.alpha == 1 && playersBeing.color.s > 0.5){

          let headyToTarget = new Vector2(playersBeing.torso).subtract(this.heady);
          let len = headyToTarget.length()
          drawVec(headyToTarget, this.heady, this.color.color, Math.min(this.heady.displayWidth, (this.heady.displayWidth+playersBeing.torso.displayWidth)*30/len))
          // console.log(playersBeing.torso)
          
          let target = velocityToTarget(this.heady, playersBeing.torso);
          let distanceToFood = Distance.BetweenPoints(this.heady, playersBeing.torso)
  
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
            } else if(angleSlugTarget < 0 && angleSlugTarget < -50) {
              rotationDirection = 1;
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
    }

}