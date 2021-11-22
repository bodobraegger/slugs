let ifWord = 'if (',
    forWord = 'for (';
let wordsFirst = [ifWord, forWord, 'move', 'help', 'abracadabra', 'clear']
let wordsForCmdString = [].concat(wordsFirst.slice(0, 2));
let wordsIfCondition = [].concat(COLORCATS_HR);


var logCount = 0;
var logMax = 5;
let terminal_log = document.getElementById('terminal_log');
let autocomplete = document.getElementById('autocomplete');
let terminal_input = document.getElementById('terminal_input');


function clearInput() {
  terminal_input.value = '';
  autocomplete.innerHTML = '';
}

var createRingBuffer = function(length){
  /* https://stackoverflow.com/a/4774081 */
  var pointer = 0, buffer = []; 

  return {
    get  : function(key){
        if (key < 0){
            return buffer[pointer+key];
        } else if (key === false){
            return buffer[pointer - 1];
        } else{
            return buffer[key];
        }
    },
    push : function(item){
      if(buffer[-1] === item) {
        return item;
      }
      buffer[pointer] = item;
      pointer = (pointer + 1) % length;
      return item;
    },
    prev : function(){
        var tmp_pointer = (pointer - 1) % length;
        if (buffer[tmp_pointer]){
            pointer = tmp_pointer;
            return buffer[pointer];
        }
    },
    next : function(){
        if (buffer[pointer]){
            pointer = (pointer + 1) % length;
            return buffer[pointer];
        }
    }
  };
};

let buffer = createRingBuffer(50);

terminal_input.addEventListener('keyup', (e) => {
	if(terminal_input.value.length > 0 ) {
    let input = terminal_input.value;
    let checkAgainst = input;

    let wordsToCompare = wordsFirst;
    
    if(input.slice(0, ifWord.length) == ifWord) {
      wordsToCompare = wordsIfCondition;
      checkAgainst = input.slice(ifWord.length);
    }
    autocomplete.innerHTML = input;

    // console.log(wordsToCompare, checkAgainst)
    
    
    
    let regex = new RegExp(`^${escapeRegExp(checkAgainst)}.*`, 'igm');
    for(let i = 0; i < wordsToCompare.length; i++){
    	if(wordsToCompare[i].match(regex)){
      	autocomplete.innerHTML += wordsToCompare[i].slice(checkAgainst.length, wordsToCompare[i].length);
        break;
      }
    }
	}
})

terminal_input.addEventListener('keydown', (e) => {
    if((e.key == 'Backspace' || e.key == 'Delete')){
        autocomplete.innerHTML = '';
        return;
    }
    if(e.key == 'Tab') {
      e.preventDefault();
      terminal_input.value = autocomplete.innerHTML;
      return;
    }
    if(e.key == 'ArrowUp') {
      e.preventDefault();
      let prev = buffer.prev();
      if(prev!==undefined){
          terminal_input.value = prev;
      }
      return;
    }
    if(e.key == 'ArrowDown') {
        e.preventDefault();
        let next = buffer.next();
        if(next!==undefined){
            terminal_input.value = next;
        }
        else {
          clearInput();
        }
        return;
    }
    if(e.key == 'Enter') {
      let cmd = terminal_input.value
      while(buffer.next() !== undefined) {};
      buffer.push(cmd)
      switch (cmd) {
        case 'clear':
          clearLog();
          break;
        
        case 'help':
          addToOutput(`hello! the commands that are available are ${wrapCmd(wordsFirst.join(', ').replaceAll('(', '...'))}.`)
          break;
        
        default:
          let CmdEvent = new CustomEvent('cmd', { 
            detail: { value: cmd }
          });
          terminal_input.dispatchEvent(CmdEvent);
          // addToLog(cmd);
        }
        clearInput();
    }
})

// TERMINAL IO FUNCTIONS
function addToOutput(output) {
  logCount++;
  if(logCount > logMax) {
    terminal_log.firstChild.remove();
  }
  let div = document.createElement('div');
  // if output is already a div, don't create a nested one.
  if(output.slice(0,4) == '<div') {
    div.innerHTML = `${output}`;
    div = div.firstElementChild;
  } else {
    div.innerHTML = `${output}`;
  }
  div.classList += ` output`;
  terminal_log.appendChild(div);
}

function clearLog() {
  terminal_log.innerHTML = '';
  logCount = 0;
}

function colorize(output, color) {
  return `<div class='colorized' style="background-color: ${color}">${output}</div>`
}

function wrapCmd(cmd) {
  return `<span class='cmd'>${cmd}</span>`
}

// STRING HELPERS
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


// INPUT PARSING
function parseEncased(parentheses, input_arr) {
  let exception_if = `uh oh, an if rule needs to be of the form ${wrapCmd('if (X) {Y}')}!`;
  let encased = '';
  let i = 0;
  word = input_arr[i];
  while(word.at(0) != parentheses[0]) {
    i++;
    word = input_arr[i];
  } word = input_arr[i].slice(1);
  while(word.at(-1) != parentheses[1]) {
    if(i >= input_arr.length) {
      addToOutput(exception_if);
      return;
    }
    encased += ` ${word}`;
    word = input_arr[i];
    i++; 
  } encased += ` ${word.slice(0, -1)}`;
  return encased
}