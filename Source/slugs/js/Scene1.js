class Scene1 extends Phaser.Scene {
    constructor() {
        super("bootGame")
    }
    create() {
        this.add.text(20, 20, "loading...")
        this.scene.start("playGame")
    }
}