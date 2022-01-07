class Snake extends Slug {
    constructor(scene=Scene2, x=0, y=0, radius=20, color=getRandomColorInCat()) {
      super(scene, x, y, radius, color, false);
      this.setDataEnabled();
      this.data.values.color = color;
      this.color = color
      this.txtr = 'smooth';
      this.shape = 'round';
      this.plantLoop = false;
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
      
      playersBeing.bodyparts.forEach(limb => {
        this.heady.setOnCollideWith(limb, pair => {
          console.log('snake colliding with', limb, pair)
          if(this.heady.displayWidth > playersBeing.torso.displayWidth) {
            playersBeing.setAlpha(0.8)
            playersBeing.saturate(false);
            playersBeing.stop();
            logOutput(`oh no! the angry creature ate your being's color :( try to get it to eat something so it can regain its color!`)
          } else {
            logOutput(`phew, your being is lucky it is too large to be eaten!`)
          }
          this.eating = false;
        });

      });

        
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
    }
    
    eat(foodType='any') {
      // having found our food stuff, move to it until you're close!
      this.eating = true  
      this.timer = 0;
      this.scene.events.on('postupdate', function(time, delta) {
        if(this.eating && playersBeing.alpha == 1 && playersBeing.color.s > 0.5){

          let headyToTarget = new Vector2(playersBeing.torso).subtract(this.heady);
          let len = headyToTarget.length()
          drawVec(headyToTarget, this.heady, this.color.color, Math.min(this.heady.displayWidth, (this.heady.displayWidth+playersBeing.torso.displayWidth)*30/len))
          // console.log(playersBeing.torso)
          
          let target = playersBeing.torso          
          let speedMod = 1;
          this.moveTo(target, speedMod);

        }
      }, this);
    }
  
    stop() {
      this.eating = false;
    }

}