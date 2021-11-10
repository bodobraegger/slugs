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

        let c = this.add.circle(1, 1, 1, 0xFFF000);

        let slug_r = 20;
        let slug_x = width/2;
        let slug_y = height/2;

        let s0 = new Slug(this, slug_x, slug_y, slug_r);
        let s1 = new Slug(this, slug_x-80, slug_y-5, 15);
        let slugs = [s0, s1];
        s1.setAlpha(0.9); 
        for(let i=0; i<20; i++) {
            let s = new Slug(this, slug_x+i*10, slug_y+i*10, (slug_r+20)*(Math.random()+0.2))
            slugs.push(s);
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

    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: "node_modules/phaser3-rex-plugins/dist/rexuiplugin.min.js",
            sceneKey: 'rexUI'
        });
    }
    processCommand(cmd) {
        console.log('processing command: ', cmd);
    }

}

class Slug extends Phaser.GameObjects.GameObject {
    constructor(scene, x, y, radius) {
        super(scene, x, y);
        let color = randomColor();
        this.head           = scene.add.circle(x, y, radius/1.5, getRandomLighterColor(color))
        this.m_head  = scene.matter.add.circle(x, y, radius/1.5);
        this.body           = scene.add.circle(x-radius+radius/1.5, y, radius, Number(parseInt(color.slice(1), 16)));
        this.m_body  = scene.matter.add.circle(x-radius+radius/1.5, y, radius);
        this.tail_0         = scene.add.circle(x-radius+radius/1.5-(radius+radius/1.3), y, radius/1.3, getRandomLighterColor(color));
        this.m_tail_0= scene.matter.add.circle(x-radius+radius/1.5-(radius+radius/1.3), y, radius/1.3);
        this.tail_1         = scene.add.circle(x-radius+radius/1.5-((radius+radius/1.3)+(radius/1.3+radius/2)), y, radius/2, getRandomLighterColor(color));
        this.m_tail_1= scene.matter.add.circle(x-radius+radius/1.5-((radius+radius/1.3)+(radius/1.3+radius/2)), y, radius/2);
        scene.matter.add.gameObject(this.head, this.m_head)
        scene.matter.add.gameObject(this.body, this.m_body)
        scene.matter.add.gameObject(this.tail_0, this.m_tail_0)
        scene.matter.add.gameObject(this.tail_1, this.m_tail_1)
        this.bodyparts = [this.head, this.body, this.tail_0, this.tail_1]

        this.headjoint  = scene.matter.add.joint(this.head, this.body, radius+radius/1.5, 0.6)
        this.bodyjoint  = scene.matter.add.joint(this.body, this.tail_0, (radius+radius/1.3), 0.6)
        this.tailjoint  = scene.matter.add.joint(this.tail_0, this.tail_1, (radius/1.3+radius/2), 0.6)
    }

    setAlpha(alpha) {
        this.bodyparts.forEach(elem => {
            elem.setAlpha(alpha)
        })
    }

    moveRandomly() {
        this.head.setVelocityX(Math.random());
        this.head.setVelocityY(Math.random());
    }
}