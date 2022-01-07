class Sluggy extends Slug {
    constructor(scene=Scene2, x=0, y=0, radius=20, color=playersBeing.color) {
      super(scene, x, y, radius, color, false);
      this.setDataEnabled();
      this.data.values.color = color;
      this.color = color
      this.txtr = 'smooth';
      this.shape = 'round';
      this.plantLoop = false;
      let headyColor = getRandomColorInCat(color).lighten(25);
      let tailColor =  getRandomColorInCat(color).lighten(25);
      
      let torsoRadius = radius/1.4
      let tail0Radius = radius/2

      this.heady = this.scene.addGameCircle(x, y, radius, headyColor);
      this.torso = this.scene.addGameCircle(x-radius-torsoRadius, y, torsoRadius, this.color);
      this.tail0 = this.scene.addGameCircle(x-radius-torsoRadius-tail0Radius, y, tail0Radius, tailColor);
      this.bodyparts = [this.heady, this.torso, this.tail0]; //this.a1, this.a2, 

      this.headyjoint  = this.scene.matter.add.joint(
        this.heady, this.torso, 
        1+(this.heady.radius+this.torso.radius)/2, 0.5, 
        {
          pointA: {x: -this.heady.radius/2, y: 0}, 
          pointB: {x: this.torso.radius/2, y: 0} }
      ); // , {pointA: {x: this.torso.radius/2, y: 0}}
      this.torsojoint  = this.scene.matter.add.joint(
        this.torso, this.tail0, 
        1+(this.torso.radius+this.tail0.radius)/2, 0.5,
        { pointA: {x: -this.torso.radius/2, y: 0}, 
          pointB: {x: this.tail0.radius/2, y: 0} }
      );
      this.headyjoint.angularStiffness = 0.2;
      
      this.joints = [
        this.headyjoint,
        this.torsojoint,
      ]

        
      this.joints.forEach(e => {
        e.originalLength = e.length;
      })
      
      playersBeing.bodyparts.forEach(limb => {
        this.heady.setOnCollideWith(limb, pair => {
          console.log('sluggy colliding with', limb, pair)
          if(this.eating) {
            // this.eating = false;
          }
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
      //this.roamTarget = this.scene.pb.torso;
      //this.moveTo(this.roamTarget.x+20, this.roamTarget.y+20)
      this.eat()
    }
    
    eat(foodType='any') {
      // having found our food stuff, move to it until you're close!
      this.eating = true  
      this.timer = 0;
      this.scene.events.on('postupdate', function(time, delta) {
        if(this.eating){
          let target = {x: this.scene.pb.heady.x+this.scene.pb.heady.displayWidth, y: this.scene.pb.heady.y+this.scene.pb.heady.displayWidth}   
                 

          let headyToTarget = new Vector2({x: target, y: target}).subtract(this.heady);
          let len = headyToTarget.length()
          drawVec(headyToTarget, this.heady, this.color.color, Math.min(this.heady.displayWidth, (this.heady.displayWidth+this.scene.pb.torso.displayWidth)*30/len))
          // console.log(this.scene.pb.torso)
          
          let speedMod = 1;
          this.moveTo(target, speedMod);

        }
      }, this);
    }
  
    stop() {
      this.eating = false;
    }

}