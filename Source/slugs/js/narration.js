//**** NARRATION 

class Narration {
    intro() {
        startNewLogSegment()
        logOutput(`welcome. on the left side of the screen you see a little being. its ${wrapCmd('color')} is ${wrapCmd(COLORCATS_HR[getColorCategory(playersBeing.color)])}.`)
        logOutput(`your goal is to enable this being to grow! it is not very clever on its own. you should communicate with it using the input below and tell it how to grow properly by commanding it to ${wrapCmd('eat')}.`)
        logOutput(`whenever the being is close to food it thinks it could eat, it will show you by <u class='beingscolor'>projecting a line to the food</u> :). other beings might do the same! when you leave the being alone for a while, it will do things on its own...`)
        logOutput(`it grows by eating fruit that's good for it - if it is hurt or eats fruit that is bad for it, it will become seethrough until it can find some good fruit again. to figure out what the being likes, it will have to try interacting with the world. to find out what you can commands you can use to talk to the being, you can enter the ${wrapCmd('help')} command.`)
        logOutput(`to communicate with the being, you will need to write what you want it to do in the box below. 
            you will see suggestions for what to type as soon as you begin typing: to autocomplete the first suggestions, press tab or the right arrow ➡️.`)
        logOutput(`and you can drag and pinch the beings in the world by clicking on them if you need to.`) //you can change what you see on the left using the ⬅️⬆️⬇️➡️ arrow keys,
        logOutput(`if you ever want to see this introduction again, type ${wrapCmd('intro')} below. try typing  ${wrapCmd('hello')} or ${wrapCmd('help')} to learn more!`)
    }

    loopNudge() {
        startNewLogSegment();
        this.loopNudged = true;
        logOutput(`you managed to get your being to grow! that's great. to make your being eat all fruits off a plant automatically, try looking at ${wrapCmd('routines')}, with the ${wrapCmd('while')} command. to learn more, try typing ${wrapCmd('help while')}.`)
    }

    hunted() {
        startNewLogSegment()
        logError(`uh oh, a larger creature is angry and hungry and wants to <u style="background-color: #${SCENE.pb.hunter.color.color.toString(16)}">eat your being, it is projecting a line to it!</u>`)
        logOutput(`you must tell your being to ${wrapCmd('flee')}!`)
        blink(terminal_log.lastChild);
        if(!(SCENE.pb.rulesParsed.filter(e => e.action =='flee').length)) {
            logOutput(`to make sure your being flees from the right creature, you need to create a flee rule! for example ${wrapCmd('if other_creature is <i>condition</i> then <i>flee</i>')}, and then tell your being to ${wrapCmd('flee')} again! the autocomplete will help you :)`)

        }
}
}