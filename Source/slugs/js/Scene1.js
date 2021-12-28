class Scene1 extends Phaser.Scene {
    constructor() {
        super("bootGame")
    }
    create() {
        this.add.text(20, 20, "loading...")
        this.scene.start("playGame")
        const GrayscalePipeline = new Phaser.Class({
            Extends: Phaser.Renderer.WebGL.Pipelines.MultiPipeline,
            initialize:
                function GrayscalePipeline(game) {
                    Phaser.Renderer.WebGL.Pipelines.MultiPipeline.call(this, {
                    game: game,
                    fragShader: `
                        precision mediump float;
                        uniform sampler2D uMainSampler;
                        varying vec2 outTexCoord;
                        void main(void) {
                        vec4 color = texture2D(uMainSampler, outTexCoord);
                        float gray = dot(color.rgb, vec3(0.5, 0.5, 0.5));
                        gl_FragColor = vec4(vec3(gray), color.a);
                    }
                    `
                });
            }
        });
        this.game.renderer.pipelines.add('Grayscale', new GrayscalePipeline(this.game));
    }
}