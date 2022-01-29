//**** NARRATION 

class Narration {
    intro_0() {
        startNewLogSegment()
        logOutput(`welcome. on the left side of the screen you see a little being. its ${wrapCmd('color')} is ${wrapCmd(COLORCATS_HR[getColorCategory(playersBeing.color)])}.`)
        logOutput(`on the bottom right, below this text, you find an input box. type ${wrapCmd('intro 1')} and press enter to learn more.`)
    }
    intro_1() {
        logOutput(`great work!`)
        logOutput(`your goal is to enable your being to grow! it is not very clever on its own. you should communicate with it using commands and tell it how to grow properly by commanding it to ${wrapCmd('eat')}.`)
        logOutput(`whenever the being is close to fruit it thinks it could ${wrapCmd('eat')}, it will show you by <u class='beingscolor'>projecting a line to the fruit</u> :). other beings might do the same! when you leave the being alone for a while, it will do things on its own...`)
        logOutput(`it grows by eating fruit that's good for it - if it is hurt or eats fruit that is bad for it, it will become seethrough until it can find some good fruit again. to figure out what the being likes, it will have to try interacting with the world. to find out what you can commands you can use to talk to the being, you can enter the ${wrapCmd('help')} command.`)
        logOutput(`once you have read this, type ${wrapCmd('intro 2')} to learn your objective!`)
    }
    intro_2() {
        startNewLogSegment()
        logOutput(`well done! this is how you can interact with the game, by typing in commands in the box below. when you start typing, suggestions will appear.`)
        logOutput(`to help make it a bit quicker, there are a few tricks: when you press the tab ⭾ or the right arrow ➡️, the first suggestion will be typed out for you. when you press the left arrow ⬅️, it will be deleted again. the up and down arrow ⬆️⬇️ keys cycle through the suggestions if there are multiple, or to cycle through the last commands if there aren't any suggestions.`)
        logError(`when you type something that the game does not understand, the box will shake a little, but don't worry, that's just to help you notice! it might also shake if a message is repeated, or there is another reason why you should look at this part of the game.`)
        logOutput(`the last way you can interact with the game is by dragging and pinching the beings in the world by clicking on them if you need to.`) //you can change what you see on the left using the ⬅️⬆️⬇️➡️ arrow keys,
        
        logOutput(`if you ever want to see the introduction again, you now know the commands to view it! (hint: ${wrapCmd('intro')} and a number for the section).`)
        logOutput(`congratulations! you now know how to play the game. have fun! if you don't know what to do, are confused, or need inspiration, try using the ${wrapCmd('help')} command! to learn more about your being, try the ${wrapCmd(showWord)} command.`)
        if(wordsToCompare.indexOf('intro') != -1) wordsToCompare.splice(wordsToCompare.indexOf('intro'), 1);
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
        tagWithClass(terminal_log.lastChild, 'blink');
        tagWithClass(terminal_log.lastChild, 'shake');
        if(!(SCENE.pb.rulesParsed.filter(e => e.action =='flee').length)) {
            logOutput(`to make sure your being flees from the right creature, you need to create a flee rule! for example ${wrapCmd('if other_creature is <i>condition</i> then <i>flee</i>')}, and then tell your being to ${wrapCmd('flee')} again! the autocomplete will help you :)`)

        }
}
}