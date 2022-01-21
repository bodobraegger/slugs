class Snake extends Slug {
    constructor(scene=Scene2, x=0, y=0, radius=20, color=getRandomColorInCat()) {
      super(scene, x, y, radius, color, false);
      this.color = color
      this.txtr = 'smooth';
      this.shape = 'round';
      this.pursuitDistance = this.torso.displayWidth * 40; 
      let headyColor = getRandomColorInCat(color);
      let tailColor =  getRandomColorInCat(color);
      
      let torsoRadius = radius/1.4
      let tail0Radius = radius/1.7
      let tail1Radius = radius/2.4

      this.heady = this.scene.addGameCircle(x, y, radius, headyColor);
      this.torso = this.scene.addGameCircleTextured(x-radius-torsoRadius, y, radius, this.color);
      this.tail0 = this.scene.addGameCircle(x-radius-torsoRadius-tail0Radius, y, tail0Radius, tailColor);
      this.tail1 = this.scene.addGameCircle(x-radius-torsoRadius-tail0Radius-tail1Radius, y, tail1Radius, tailColor);
      this.bodyparts = [this.heady, this.torso, this.tail0, this.tail1]; //this.a1, this.a2, 

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
      
      this.joints = [
        this.headyjoint,
        this.torsojoint,
        this.tailjoint
      ]

      let currentDist = radius+torsoRadius+tail0Radius+tail1Radius;
      for(let i = 0; i < 3; i++) {
        let currentRadius = radius/(2.4+i*0.6) 
        currentDist += currentRadius;
        this.bodyparts.push(
          this.scene.addGameCircle(x-currentDist, y, currentRadius, getRandomColorInCat(color).lighten(FloatBetween(0.2, 0.8)*20*(i+1)))
        )
        let prev = this.bodyparts.at(-2);
        let curb = this.bodyparts.at(-1);
        let j = this.scene.matter.add.joint(
          prev, curb, 
          2+(prev.radius+curb.radius)/2, 0.5,
          { pointA: {x: -prev.radius/2, y: 0}, 
          pointB: {x: curb.radius/2, y: 0} }
        );
        this.joints.push(j)
      }
        
      this.joints.forEach(e => {
        e.originalLength = e.length;
      })
      
      this.setOnCollidesWithBeings()
      
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
      this.rulesParsed = [ ];
      this.roaming = true;
      this.roamingTarget = this.getRandomPointClose(this.torso);
    }
    
    eat(foodType='any') {
      // having found our food stuff, move to it until you're close!
      this.eating = true  
      this.timer = 0;
      if(foodType=='any' || foodType =='healthy') {
        let possible_victims = []
        BEINGS.getMatching('active', true).forEach(b => {
          if(sameColorCategory(b.color, this.color), b.torso.displayWidth < this.heady.displayWidth) {
            possible_victims.push(b);
          }
        });
        if(!possible_victims.length) {
          return;
        }
        this.hunted = possible_victims[0];
        possible_victims.forEach(v => {
          if(Distance.BetweenPointsSquared(this.heady, v.torso) < Distance.BetweenPointsSquared(this.heady, this.hunted.torso)) {
            this.hunted = v;
          }
        }) 
      }
      if(foodType=='player'){
        this.hunted = this.scene.pb
      }
      let headyToTarget = new Vector2(this.hunted.torso).subtract(this.heady);
      if(!this.hunted.hunter && this.hunted.alpha == 1 && this.hunted.color.s > 0.5 && headyToTarget.length() < this.pursuitDistance){
        this.hunted.hunter = this
        if(this.hunted == this.scene.pb) {
          if(this.scene.stage >= 3) {
            NARRATION.hunted();
          } else {
            this.stop();
          }
        }
      }
      this.scene.events.on('postupdate', function(time, delta) {
        if(this.eating && this.hunted.alpha == 1 && this.hunted.color.s > 0.5 && headyToTarget.length() < this.pursuitDistance){
          headyToTarget = new Vector2(this.hunted.torso).subtract(this.heady);
          let len = headyToTarget.length()
          drawVec(headyToTarget, this.heady, this.color.color, Math.min(this.heady.displayWidth, (this.heady.displayWidth+this.hunted.torso.displayWidth)*30/len))
          // console.debug(this.hunted.torso)
          
          let target = this.hunted.torso          
          let speedMod = 1;
          this.moveTo(target, speedMod);
          this.hunted.hunter = this;

        }
        else if(this.eating && this.hunted.hunter == this) {
          if(this.hunted == this.scene.pb) {
            // logOutput('your being is no longer being <u class="enemycolor">hunted</u> :).')
          }
          this.stop();
        }
      }, this);
    }
  
    stop() {
      this.eating = false;
      if(this.hunted) {
        try {
          if(this.hunted.hunter == this) {
            this.hunted.hunter = null;
          }
        } catch(error) {
          console.debug(error, this.hunted, 'already cleared hunter...')
        }
        this.hunted = null;
      }
    }

    setOnCollidesWithBeings() {
      BEINGS.getMatching('active', true).forEach(b=>{
        b.bodyparts.forEach(limb => {
          this.heady.setOnCollideWith(limb, pair => {
            // console.debug('snake colliding with', limb, pair)
            if(this.eating && b==this.hunted && this.hunted.hunter == this) {
              console.debug('collision with', b, b==this.scene.pb, b==this.hunted)
              if(this.hunted) if(this.hunted.hunter){'IT WORKS', console.debug(this.hunted.hunter)}
              if(this.heady.displayWidth > b.torso.displayWidth) {
                // successfully ate
                b.setAlpha(0.8)
                b.saturate(false);
                b.stop();
                if(this.scene.pb == b) {
                  logOutput(`oh no! the angry creature ate your being's color :( try to get it to eat something so it can regain its color!`)
                }
                if(sameColorCategory(this.color, b.color)) {
                  this.setScale(this.scale+0.2);
                } else {
                  this.setAlpha(0.8);
                }
              } else if(this.scene.pb == b) {
                logOutput(`phew, your being is lucky it is too large to be eaten!`)
              }
              this.eating = false;
            }
          });
        });
      })
    }

}