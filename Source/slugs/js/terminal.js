const ifWord = 'if',
    forWord = 'for',
    equalWord = 'is',
    thenWord = 'then',
    andWord = 'and',
    orWord = 'or';

const wordsFirst = [ifWord, forWord, 'move', 'help', 'abracadabra', 'clear']
const wordsForCmdString = [].concat(wordsFirst.slice(0, 2));
let wordsIfConditionLeft = ['color', 'shape', 'size'];
let wordsIfConditionRight = [].concat(COLORCATS_HR);
const wordsBoolean = [thenWord, andWord, orWord];

let wordsAction = ['eat']

let wordsAll = wordsFirst.concat(wordsIfConditionLeft).concat(wordsIfConditionRight).concat(equalWord).concat(wordsBoolean).concat(wordsAction);


let logCount = 0;
let logMax = 5;
const terminal_log = document.getElementById('terminal_log');
const autocomplete = document.getElementById('autocomplete');
const terminal_input = document.getElementById('terminal_input');

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
    
    let wordsInput = input.match(/\w+/g);
    let wordsOfInterest = wordsInput;
    let current_word = wordsInput.at(-1);
    let last_word = wordsInput.at(-1);
    console.log(input, wordsOfInterest, current_word);
    
    if(wordsOfInterest[0] == ifWord) {
      wordsToCompare = wordsIfConditionLeft;
      checkAgainst = wordsOfInterest.at(-1);
      if(wordsAll.includes(current_word) == false) {
        console.log('word not recognized')
        wordsOfInterest = wordsOfInterest.slice(0, wordsOfInterest.length-1)
        for(let i = 1; i < wordsOfInterest.length; i++) {
          if(!wordsAll.includes(wordsOfInterest[i])) {
            console.log(wordsOfInterest[i], 'not in list of all words!')
            return;
          }
        }
      }
      else {
        checkAgainst = '';
      }
      // parse condition
      if(wordsOfInterest.length > 1) {
        // IF even number of words, then we have...
        if(wordsOfInterest.length % 2 == 0) {
          // if xx is yy then zz ... 
          if(wordsAction.includes(current_word)) {
            // console.log('// if xx is yy then zz')
            return;
          }
          // if XX is YY..., 
          else if(wordsOfInterest.at(-2) == equalWord) {
            // console.log('// if XX is YY...,')
            wordsToCompare = wordsBoolean;
          }
          // OR if XX ..., OR if XX is YY and ZZ ... 
          else if(wordsOfInterest.at(-2) == ifWord || wordsBoolean.includes(wordsOfInterest.at(-2))) {
            // console.log('// OR if XX ..., OR if XX is YY and ZZ ...')
            wordsToCompare = [equalWord]; 
          }
          else if(wordsOfInterest.at(-1) == thenWord) {
            wordsToCompare = wordsAction;
          } 
        }
        // ELSE we have ...
        else if(wordsBoolean.concat(equalWord).includes(current_word)) {
          // if XX is YY then ...,
          if(current_word == thenWord) {
            // console.log('// if XX is YY then ...,')
            wordsToCompare = wordsAction;
          }
          // if XX is ..., 
          else if(current_word == equalWord) {
            // console.log('// if XX is ...,')
            wordsToCompare = wordsIfConditionRight;
            // console.log('juhui')
          }
          // OR if XX is YY and ... 
          else if(wordsBoolean.includes(wordsOfInterest.at(-2))) {
            // console.log('// OR if XX is YY and ...')
            wordsToCompare = wordsIfConditionLeft;
          }
        }
      }
    }
    console.log(checkAgainst, wordsToCompare);
    
    
    autocomplete.innerHTML = input;
    let regex = new RegExp(`^${escapeRegExp(checkAgainst)}.*`, 'igm');
    for(let i = 0; i < wordsToCompare.length; i++){
    	if(wordsToCompare[i].match(regex)){
        if(wordsAll.includes(last_word)) {
          autocomplete.innerHTML += ' ';
        }
        else {
          autocomplete.innerHTML = autocomplete.innerHTML.trimEnd();
        }
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
      terminal_input.value = autocomplete.innerText;
      return;
    }
    if(e.key == 'ArrowUp') {
      e.preventDefault();
      let prev = buffer.prev();
      if(prev!==undefined){
          terminal_input.value = prev.join(' ');
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
      let cmd = terminal_input.value.match(/\w+/g)
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