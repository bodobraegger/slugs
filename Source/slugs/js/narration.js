//**** NARRATION 

class Narration {
    intro() {
        startNewLogSegment()
        logOutput(`dear player, welcome to this little game. on the left side of the screen you see a little being, in its little sea around it. its color is ${wrapCmd(COLORCATS_HR[getColorCategory(playersBeing.color)])}.`)
        logOutput(`your goal is to enable this being to grow! it is not very clever on its own. so you should communicate with it using the input below and tell it how to grow properly.`)
        logOutput(`it grows by eating fruit that's good for it - if it is hurt or eats fruit that is bad for it, it will become seethrough until it can find some good fruit again.`)
        logOutput(`you can change what you see on the left using the ⬅️⬆️⬇️➡️ arrow keys, and you can drag and pinch the beings in the world by clicking on them if you need to!`)
        logOutput(`whenever the being is close to food it thinks it could eat, it will show you by <u class='beingscolor'>projecting a line to the food</u> :). Other beings might do the same!`)
        logOutput(`to communicate with the being, you will need to write what you want to do in the box below. if you ever want to see this introduction again, type ${wrapCmd('intro')} below. try typing  ${wrapCmd('hello')} or  ${wrapCmd('help')} to learn more!`)
    }
    hunted() {
        startNewLogSegment()
        logError(`uh oh, a larger creature is angry and hungry and wants to <u class='playerscolor'>eat your being, it is project a line to it!</u>`)
        logOutput(`you must quickly make a flee rule: ${wrapCmd('if other_creature is <i>condition</i> then <i>flee</i>')}, and then tell your being to ${wrapCmd('flee')}!`)
    }
}