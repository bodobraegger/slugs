class Scene2 extends Phaser.Scene {
    constructor() {
        super("playGame")
    }

    create() {
        let width = this.scale.gameSize.width;
        let height = this.scale.gameSize.height;
        this.add.text(20, 20, "playing...", {
            font: '25px Mono',
            fill: 'red'
        })
        this.matter.world.setBounds();
        this.matter.add.mouseSpring();
        this.cameras.main.setZoom(0.5);
        this.cameras.main.centerOn(document.getElementById("phaser_container").clientWidth/2, document.getElementById("phaser_container").clientHeight/2);
    

        let circle = this.add.circle(1, 1, 10, 0xFFF000);
        let arc = this.add.arc(100, 100, 50, 1, 180, false, 0xFFF000)
        let rectangle = this.matter.add.gameObject(this.add.rectangle(400, 200, 20, 10, 0x9966ff), this.matter.add.rectangle(400, 200, 20, 10))

        let radius = 100

        let antenna_vertices = `0 0 0 ${2*radius} ${2*radius} ${1.5*radius} ${2*radius} ${0.5*radius}`;
        // let antenna_vertices = [0,0, 0,2*radius, 2*radius,1.5*radius, 2*radius,.5*radius]

        let polygon = this.matter.add.gameObject(this.add.polygon(200, 400, antenna_vertices, 0xFF22FF),  { shape: { type: 'fromVerts', verts: antenna_vertices, flagInternal: true } });
        //polygon = this.matter.add.gameObject(polygon, m_polygon);

        let group = this.add.group([circle, arc, rectangle, polygon]);
        group.setAlpha(0.5)

        let matterArc = this.matter.add.trapezoid(1, 1, 10, 20, 0.5);

        let slug_r = 20;
        let slug_x = width/2;
        let slug_y = height/2;

        this.yourSlug = new Slug(this, slug_x, slug_y, slug_r);
        let s1 = new Slug(this, slug_x-80, slug_y-5, 15);
        this.slugs = [this.yourSlug, s1];
        s1.setAlpha(0.9); 
        
        
        for(let i=0; i<5; i++) {
            let rand = (Math.random()+0.2)
            let s = new Slug(this, slug_x+i*10*rand, slug_y+i*10*rand, (slug_r+20)*rand)
            this.slugs.push(s);
        }
        
        
        // RENDER TERMINAL ON TOP OF PHASER
        const terminal_container = document.getElementById('terminal_container');
        const ph_terminal_container = this.add.dom(0.8*width, 0.9*height, terminal_container)
        const terminal_input = document.getElementById('terminal_input');

        terminal_input.addEventListener('cmd', (e) => {
            // WE HAVE A HOOK INTO THE TERMINAL
            this.processCommand(e.detail.value);
        });


        /*
        const text = this.add.text(400, 300, 'Hello World', { fixedWidth: 150, fixedHeight: 36 })
        text.setOrigin(0.5, 0.5)
    
        text.setInteractive().on('pointerdown', () => {
            const editor = this.rexUI.edit(text);
            const elem = editor.inputText.node;
            elem.style.backgroundColor='white';
            elem.style.color='pink';

        })*/


    }
    update() {
        /*
        if(this.follow = true) {
            this.cameras.main.scrollX = this.yourSlug.body.x - document.getElementById("phaser_container").clientWidth/2;
            this.cameras.main.scrollY = this.yourSlug.body.y - document.getElementById("phaser_container").clientHeight/2;
        }*/
        // this.slugs.forEach(element => { element.moveRandomly() });
    }

    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: "node_modules/phaser3-rex-plugins/dist/rexuiplugin.min.js",
            sceneKey: 'rexUI'
        });
    }
    processCommand(input) {
        let cmd = input.trim().split(/\s+/);
        console.log('processing command: ', cmd);
        if(cmd.length < 1 || cmd[0] == '') { return; }
        if(cmd[0] == 'abracadabra') {
            this.yourSlug.moveRandomly();
            this.yourSlug.joints.forEach(e=>{
                this.matter.world.removeConstraint(e);
            }); 
        }
        if(cmd[0] == 'move') {
            this.yourSlug.moveRandomly();
        }
        if(cmd[0] == 'follow') [
            this.follow = true
        ]
    }

    addGameCircle(x, y, radius, color) {
        let circle = this.add.circle(x, y, radius, color);
        let matterCircle = this.matter.add.circle(x, y, radius);
        return this.matter.add.gameObject(
                   circle,
            matterCircle
        )
    }

}

class Slug extends Phaser.GameObjects.Group {
    constructor(scene, x, y, radius) {
        super(scene, []);
        this.classType = Phaser.GameObjects.Arc;
        let color = randomColor();
        let headColor = getRandomLighterColor(color);
        this.head = this.scene.addGameCircle(x, y, radius/1.5, headColor);
        this.body = this.scene.matter.add.gameObject(
                   this.scene.add.circle(x-radius+radius/1.5, y, radius, Number(parseInt(color.slice(1), 16))), 
            this.scene.matter.add.circle(x-radius+radius/1.5, y, radius)
        );
        this.tail_0 = this.scene.matter.add.gameObject(
                   this.scene.add.circle(x-radius+radius/1.5-(radius+radius/1.3), y, radius/1.3, getRandomLighterColor(color)), 
            this.scene.matter.add.circle(x-radius+radius/1.5-(radius+radius/1.3), y, radius/1.3)
        );
        this.tail_1 = this.scene.matter.add.gameObject(
                   this.scene.add.circle(x-radius+radius/1.5-((radius+radius/1.3)+(radius/1.3+radius/2)), y, radius/2, getRandomLighterColor(color)), 
                   this.scene.matter.add.circle(x-radius+radius/1.5-((radius+radius/1.3)+(radius/1.3+radius/2)), y, radius/2)
        );
        
        this.headjoint  = this.scene.matter.add.joint(
            this.head, this.body, 
            (this.head.radius+this.body.radius)/2, 0.6, 
            { pointA: {x: this.head.radius/2, y: 0}, 
              pointB: {x: this.body.radius/2, y: 0} }
        ); // , {pointA: {x: this.body.radius/2, y: 0}}
        this.bodyjoint  = this.scene.matter.add.joint(
            this.body, this.tail_0, 
            (this.body.radius+this.tail_0.radius)/2, 0.6,
            { pointA: {x: -this.body.radius/2, y: 0}, 
              pointB: {x: -this.tail_0.radius/2, y: 0} }
        );
        this.tailjoint  = this.scene.matter.add.joint(
            this.tail_0, this.tail_1, 
            (this.tail_0.radius+this.tail_1.radius)/2, 0.6,
            { pointA: {x: this.tail_0.radius/2, y: 0}, 
              pointB: {x: this.tail_1.radius/2, y: 0} }
        );
        this.headjoint.angularStiffness = 0.8;
        let antennaeColor = this.head.fillColor;
        /*
        let antennaVertices = `0 0 0 ${radius} ${radius} ${0.75*radius} ${radius} ${0.25*radius}`;
        // let antenna_vertices = [0,0, 0,2*radius, 2*radius,1.5*radius, 2*radius,.5*radius]

        let a0 = this.scene.matter.add.gameObject(
            this.scene.add.polygon(x+radius, y+radius/1.5, antennaVertices, antennaeColor), 
            { shape: { type: 'fromVerts', verts: antennaVertices, flagInternal: true } }
        );

        let a1 = this.scene.matter.add.gameObject(
            this.scene.add.polygon(x+radius, y-radius/1.5, antennaVertices, antennaeColor), 
            { shape: { type: 'fromVerts', verts: antennaVertices, flagInternal: true } }
        );
        this.antennae = this.scene.add.group([a0, a1])
        
        this.scene.matter.add.joint(this.antennae.getChildren().at(-1), this.head, 2*radius/1.5, 0.6);
        this.scene.matter.add.joint(this.antennae.getChildren().at(-2), this.head, 2*radius/1.5, 0.6);
        this.scene.matter.add.joint(this.antennae.getChildren().at(-1), this.antennae.getChildren().at(-2), 2*radius/1.5, 0.6);
        let a1 = new Antenna(scene, x+radius/1.5+radius/5, y, radius/5, headColor);
        let a2 = new Antenna(scene, x+radius/1.5+radius/5, y, radius/5, headColor);
        let antennae = [a1, a2]
        this.scene.matter.add.joint(this.head, a1.getChildren().at(0), radius/1.5+radius/5, 0.9);
        this.scene.matter.add.joint(this.head, a2.getChildren().at(0), radius/1.5+radius/5, 0.9);
        
 
        a1.getChildren().forEach((element, i) => {
            this.scene.matter.add.joint(element, a2.getChildren().at(i), radius, 0.6)
        });
        this.scene.matter.add.joint(a1.getChildren().at(0), a2.getChildren().at(-1), a1.radius * 2, 0.5)
        this.scene.matter.add.joint(a2.getChildren().at(0), a1.getChildren().at(-1), a1.radius * 2, 0.5)
        
        */
        

       
       let antennaLength = this.head.radius;
        let a1 = this.scene.matter.add.gameObject(
            this.scene.add.rectangle(x+this.head.radius*2, y, antennaLength, antennaLength/4, antennaeColor),
            this.scene.matter.add.rectangle(x+this.head.radius*2, y, antennaLength, antennaLength/4)
        )
        let a2 = this.scene.matter.add.gameObject(
            this.scene.add.rectangle(x+this.head.radius*2, y, antennaLength, antennaLength/4, antennaeColor),
            this.scene.matter.add.rectangle(x+this.head.radius*2, y, antennaLength, antennaLength/4)
        )

        this.antennaeJoints = [
            // this.scene.matter.add.joint(a1, a2, antennaLength/2, 0.5, {pointA: {x: antennaLength/2, y: 0}, pointB: {x: antennaLength/2, y: 0}}),
            this.scene.matter.add.joint(this.head, a1, 3, 0.5, {damping:0.5, pointA: {x: -this.head.radius, y: -this.head.radius/4}, pointB: {x: antennaLength/2, y: 0}}),
            this.scene.matter.add.joint(this.head, a2, 3, 0.5, {damping:0.5,pointA: {x: -this.head.radius, y: this.head.radius/4}, pointB: {x: antennaLength/2, y: 0}}),
            this.scene.matter.add.joint(a1, a2, antennaLength, 0.5, {damping:0.5,pointA: {x: -antennaLength/2, y: 0}, pointB: {x: -antennaLength/2, y: 0}}),
            this.scene.matter.add.joint(a1, a2, antennaLength*1.5, 0.5, {damping:0.5,pointA: {x: -antennaLength/2, y: 0}, pointB: {x: antennaLength/2, y: 0}}),
            this.scene.matter.add.joint(a2, a1, antennaLength*1.5, 0.5, {damping:0.5,pointA: {x: -antennaLength/2, y: 0}, pointB: {x: antennaLength/2, y: 0}}),
            
        ]

        this.joints = [
            this.headjoint,
            this.bodyjoint,
            this.tailjoint
        ]
        this.antennaeJoints.forEach(e=> {
            this.joints.push(e);
        });
        this.joints.forEach(e => {
        })
        

        let antennae = [a1, a2]

        this.antennae = this.scene.add.group(antennae)
        this.a1 = a1;
        this.a2 = a2;
        this.head.body.allowRotation=false;
        this.head.body.damping = 
        this.a1.body.allowRotation=false;
        this.a2.body.allowRotation=false;
        this.bodyparts = [this.a1, this.a2, this.head, this.body, this.tail_0, this.tail_1];
        this.addMultiple(this.bodyparts);
    }

    moveRandomly() {
        this.scene.matter.applyForce(this.head, {x: getRandomInclusive(-0.2, 0.2), y: getRandomInclusive(-0.2, 0.2)})
    }
}

class Antenna extends Phaser.GameObjects.Group {
    constructor(scene, x, y, radius, color) {
        super(scene, []);
        this.classType = Phaser.GameObjects.Arc;
        this.radius = radius;
        this.color = color;
        for(let i = 0; i < 3; i++) {
            let c = this.scene.addGameCircle(x, y, radius, color);
            this.add(c);
            x = x + radius;
        }
        for(let i = 0; i < this.children.size-1; i++) {
            this.scene.matter.add.joint(this.getChildren().at(i), this.getChildren().at(i+1), radius*2, 0.3); 
        }
        // this.scene.matter.add.joint(this.getChildren().at(0), this.getChildren().at(-1), radius * (this.children.size+1), 0.1)
    }
}


function getRandomInclusive(min, max) {
    return Math.random() * (max - min) + min; //The maximum is inclusive and the minimum is inclusive
  }
  