// 6 categories of hues, hue of 0 and 1 both correspond to red, so cats need to be shifted by half a value
let COLORCATS_HR  = ['red', 'yellow/orange', 'green', 'blue', 'purple', 'pink']
let COLORCATS_360 = [15, 75, 165, 240, 285, 330]
let COLORCATS     = [ 0 ];
for(let i = 0; i < COLORCATS_360.length; i++) {
  COLORCATS.push(COLORCATS_360[i]/360);
}
console.log(COLORCATS)

/* hue help
#ff0040	    rgb(255, 0, 64)	    hsl(345, 100%, 50%)
#ff0000	    rgb(255, 0, 0)	    hsl(0, 100%, 50%)
#ff4000	    rgb(255, 64, 0)	    hsl(15, 100%, 50%)

#ff8000	    rgb(255, 128, 0)	  hsl(30, 100%, 50%)
#ffbf00	    rgb(255, 191, 0)	  hsl(45, 100%, 50%)
#ffff00	    rgb(255, 255, 0)	  hsl(60, 100%, 50%)
#bfff00	    rgb(191, 255, 0)	  hsl(75, 100%, 50%)

#80ff00	    rgb(128, 255, 0)	  hsl(90, 100%, 50%)
#40ff00	    rgb(64, 255, 0)	    hsl(105, 100%, 50%)
#00ff00	    rgb(0, 255, 0)	    hsl(120, 100%, 50%)
#00ff40	    rgb(0, 255, 64)	    hsl(135, 100%, 50%)
#00ff80	    rgb(0, 255, 128)	  hsl(150, 100%, 50%)

#00ffbf	    rgb(0, 255, 191)	  hsl(165, 100%, 50%)
#00ffff	    rgb(0, 255, 255)	  hsl(180, 100%, 50%)
#00bfff	    rgb(0, 191, 255)	  hsl(195, 100%, 50%)
#0080ff	    rgb(0, 128, 255)	  hsl(210, 100%, 50%)
#0040ff	    rgb(0, 64, 255)	    hsl(225, 100%, 50%)
#0000ff	    rgb(0, 0, 255)	    hsl(240, 100%, 50%)

#4000ff	    rgb(64, 0, 255)	    hsl(255, 100%, 50%)
#8000ff	    rgb(128, 0, 255)	  hsl(270, 100%, 50%)
#bf00ff	    rgb(191, 0, 255)	  hsl(285, 100%, 50%)

#ff00ff	    rgb(255, 0, 255)	  hsl(300, 100%, 50%)
#ff00bf	    rgb(255, 0, 191)	  hsl(315, 100%, 50%)
#ff0080	    rgb(255, 0, 128)	  hsl(330, 100%, 50%)
*/

const ifWord = 'if',
    forWord = 'for',
    equalWord = 'is';
const wordsFirst = [ifWord, forWord, 'move', 'help', 'abracadabra', 'clear']
const wordsForCmdString = [].concat(wordsFirst.slice(0, 2));
const wordsIfCondition = [].concat(COLORCATS_HR);


const logCount = 0;
const logMax = 5;
const terminal_log = document.getElementById('terminal_log');
const autocomplete = document.getElementById('autocomplete');
const terminal_input = document.getElementById('terminal_input');


export { COLORCATS, COLORCATS_HR, COLORCATS_360, ifWord, forWord, wordsFirst, wordsForCmdString, wordsIfCondition, logCount, logMax, terminal_log, terminal_input, autocomplete}

/* MODULE, SO WE NEED TO DECLARE VARIABLES TO BE PART OF WINDOW TOO */

window.COLORCATS = COLORCATS
window.COLORCATS_HR = COLORCATS_HR
window.COLORCATS_360 = COLORCATS_360
window.ifWord = ifWord
window.forWord = forWord
window.wordsFirst = wordsFirst
window.wordsForCmdString = wordsForCmdString
window.wordsIfCondition = wordsIfCondition
window.logCount = logCount
window.logMax = logMax
window.terminal_log = terminal_log
window.terminal_input = terminal_input
window.autocomplete = autocomplete
