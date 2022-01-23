const ifWord = 'if',
    loopWord = 'while',
    equalWord = 'is',
    thenWord = 'then',
    andWord = 'and',
    orWord = 'or',
    stopWord = 'stop',
    showWord = 'tell',
    editWord = 'replace',
    deleteWord = 'forget';

let wordsAction = ['eat', stopWord, 'flee']

const wordsFirst = wordsAction.concat([ifWord, loopWord, showWord, editWord, deleteWord, 'help', 'clear'])
const wordsForCmdString = [].concat(wordsFirst.slice(0, 2));
let wordsIfConditionLeft = [].concat(ENTITY_TYPES);
let wordsIfConditionRight = [].concat(SIZES, COLORCATS_HR, TEXTURES);
const wordsBoolean = [thenWord, equalWord] //orWord, ;

let wordsLoop1 = ['fruit'];
let wordsLoop2 = [equalWord];
let wordsLoop3 = ['on', ] // 'close'
let wordsLoop4 = ['plant']


let wordsToShow = ATTRIBUTES.concat(EDITABLE);

let wordsAll = wordsFirst.concat(wordsIfConditionLeft, wordsIfConditionRight, equalWord, wordsBoolean, wordsAction, wordsToShow, wordsLoop1, wordsLoop2, wordsLoop3, wordsLoop4).concat(['hunting']);

let wordsFilter = ['the', 'a', 'my', 'me', 'there']

let wordsAllArrays = [wordsAction, wordsFirst, wordsIfConditionLeft, wordsIfConditionRight, wordsBoolean, wordsToShow];
let wordsAllArraysStrings = ['wordsAction', 'wordsFirst', 'wordsIfConditionLeft', 'wordsIfConditionRight', 'wordsBoolean', 'wordsToShow'];

let logCount = 0;
let logMax = 5;

let logId = 0;

const terminal_container = document.getElementById('terminal_container');
const terminal_log = document.getElementById('terminal_log');
const terminal_log_input = document.getElementById('terminal_log_input');
const terminal_log_output = document.getElementById('terminal_log_output');
const autocomplete = document.getElementById('autocomplete');
const autocomplete_suggestions = document.getElementById('autocomplete_suggestions');
const terminal_input = document.getElementById('terminal_input');
const toBottomBtn = document.getElementById('toBottom');

let rgbaError = 'rgba(255,102,0)'
let rgbaOutput ='rgba(175,143,233)'
let rgbaInput = 'rgba(240,160,75)'


function clearInput() {
  terminal_input.value = '';
  autocomplete.innerHTML = '';
  autocomplete_suggestions.innerHTML = '';
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
let suggestions = []
let wordsToCompare = []

terminal_input.addEventListener('keyup', (e) => {
  if(terminal_input.value.length > 0 ) {
    // clean up input
    if(e.key==' ' && (terminal_input.value.at(e.target.Selectionstart-1) == ' ' )) {
      terminal_input.value = terminal_input.value.trimStart()
      return;
    }
    let input = terminal_input.value;
    let checkAgainst = input;

    wordsToCompare = wordsFirst;
    
    let wordsInput = input.match(/\w+/g);
    let wordsOfInterest = wordsInput;
    let current_word = wordsInput.at(-1);
    let last_word = (' ' + current_word).slice(1);
    
    if(wordsOfInterest[0] == ifWord) {
      wordsToCompare = wordsIfConditionLeft;
      checkAgainst = wordsOfInterest.at(-1);
      let i = 1
      for( ; i < wordsOfInterest.length; i++) {
        if(!wordsAll.includes(wordsOfInterest[i])) {
          // console.debug(wordsOfInterest[i], 'not in list of all words!')
          wordsOfInterest = wordsOfInterest.slice(0, i);
          current_word = wordsOfInterest[i-1];
          break
        }
      }
      if(i == wordsInput.length) {
        checkAgainst = '';
      }
      // parse condition
      if(wordsOfInterest.length > 1) {
        // TODO: FIX AUTOCOMPLETE RENDER WITH WHITESPACE IN MIDDLE
        // IF even number of words, then we have...
        if(wordsOfInterest.length % 2 == 0) {
          // if xx is yy then zz ... 
          if(wordsAction.includes(current_word)) {
            // console.debug('// if xx is yy then zz')
            return;
          }
          // if XX is YY..., 
          else if(wordsOfInterest.at(-2) == equalWord) {
            // console.debug('// if XX is YY...,')
            wordsToCompare = [thenWord];
          }
          // OR if XX ..., OR if XX is YY and ZZ ... 
          else if(wordsOfInterest.at(-2) == ifWord || wordsBoolean.includes(wordsOfInterest.at(-2))) {
            // console.debug('// OR if XX ..., OR if XX is YY and ZZ ...')
            wordsToCompare = [equalWord]; 
          }
          else if(wordsOfInterest.at(-1) == thenWord) {
            wordsToCompare = ['eat'];
            if(wordsOfInterest.at(-4) == 'other_creature') {
              wordsToCompare = ['flee'];
            }
          } 
        }
        // ELSE we have ...
        else if(wordsBoolean.concat(equalWord).includes(current_word)) {
          // if XX is YY then ...,
          if(current_word == thenWord) {
            // console.debug('// if XX is YY then ...,')
            wordsToCompare = ['eat'];
            if(wordsOfInterest.at(-4) == 'other_creature') {
              wordsToCompare = ['flee'];
            }
          }
          // if XX is ..., 
          else if(current_word == equalWord) {
            // console.debug('// if XX is ...,')
            if(wordsOfInterest.at(-2) == 'fruit') {
              wordsToCompare = wordsIfConditionRight;
            } else if(wordsOfInterest.at(-2) == 'other_creature') {
              wordsToCompare = ['hunting']
            }
          }
          // OR if XX is YY and ... 
          else if(wordsBoolean.includes(wordsOfInterest.at(-2))) {
            // console.debug('// OR if XX is YY and ...')
            wordsToCompare = wordsIfConditionLeft;
            // console.debug('juhui')
          }
        }
      }
    } else if(wordsOfInterest[0] == showWord) {
      wordsToCompare = wordsToShow;
      checkAgainst = wordsOfInterest.at(-1);
      let i = 1
      for( ; i < wordsOfInterest.length; i++) {
        if(!wordsAll.includes(wordsOfInterest[i])) {
          wordsOfInterest = wordsOfInterest.slice(0, i);
          current_word = wordsOfInterest[i-1];
          break
        }
      }
      if(i == wordsInput.length) {
        checkAgainst = '';
      }
      if(i>1) {
        return;
      }
    } else if(wordsOfInterest[0] == 'help') {
      wordsToCompare = wordsFirst;
      checkAgainst = wordsOfInterest.at(-1);
      let i = 1
      for( ; i < wordsOfInterest.length; i++) {
        if(!wordsAll.includes(wordsOfInterest[i])) {
          wordsOfInterest = wordsOfInterest.slice(0, i);
          current_word = wordsOfInterest[i-1];
          break
        }
      }
      if(i == wordsInput.length) {
        checkAgainst = '';
      }
      if(i>1) {
        return;
      }
    } else if(wordsOfInterest[0] == deleteWord || wordsOfInterest[0] == editWord) {
      wordsToCompare = EDITABLE_withSingular;
      checkAgainst = wordsOfInterest.at(-1);
      let i = 1
      for( ; i < wordsOfInterest.length; i++) {
        if(!wordsAll.includes(wordsOfInterest[i])) {
          wordsOfInterest = wordsOfInterest.slice(0, i);
          current_word = wordsOfInterest[i-1];
          break
        }
      }
      if(i == wordsInput.length) {
        checkAgainst = '';
      }
      if(i>1) {
        return;
      }
    } else if(wordsOfInterest[0] == loopWord) {
      wordsToCompare = wordsLoop1;
      checkAgainst = wordsOfInterest.at(-1);
      let i = 1
      for( ; i < wordsOfInterest.length; i++) {
        if(!wordsAll.includes(wordsOfInterest[i])) {
          wordsOfInterest = wordsOfInterest.slice(0, i);
          current_word = wordsOfInterest[i-1];
          break
        }
      }
      if(i == wordsInput.length) {
        checkAgainst = '';
      }
      // parse condition
      if(wordsOfInterest.length > 1) {
        if(wordsLoop1.includes(current_word)) {
          wordsToCompare = wordsLoop2;
        }
        else if(wordsLoop2.includes(current_word)) {
          wordsToCompare = wordsLoop3
        } else if(current_word == 'on') {
          wordsToCompare = wordsLoop4;
        } else if(wordsLoop4.includes(current_word) || current_word == 'close') {
          wordsToCompare = 'eat'; // wordsAction
        }
        if(current_word == 'eat') {
          return;
        }
      }
    }
    // console.debug(input, wordsOfInterest, current_word);
    // console.debug(checkAgainst, wordsToCompare);
    
    
    autocomplete.innerHTML = input;
    let nextWord = '';
    let regex = new RegExp(`^${escapeRegExp(checkAgainst)}.*`, 'igm');
    for(let i = 0; i < wordsToCompare.length; i++){
      if(wordsToCompare[i].match(regex)){
        if(wordsAll.includes(last_word)) {
          autocomplete.innerHTML += ' ';
        }
        else {
          autocomplete.innerHTML = autocomplete.innerHTML.trimEnd();
        }
        nextWord = wordsToCompare[i].slice(checkAgainst.length, wordsToCompare[i].length);
      	autocomplete.innerHTML += nextWord;
        if(wordsToCompare != wordsIfConditionLeft && wordsToCompare != wordsAction && wordsToCompare != wordsBoolean && wordsToCompare != wordsToShow) {
          /*
          console.debug('shuffling', wordsToCompare)
          let t = wordsToCompare[0];
          wordsToCompare.splice(0, 1);
          wordsToCompare.push(t)
          */
        shuffleArrayButFirst(wordsToCompare)
        }
        break;
      }
    }
    suggestions = [];
    // if a next word is suggested, also suggest other possibilities
    if(autocomplete.innerHTML.includes(nextWord) && nextWord != '' && wordsToCompare.includes(nextWord)) {
      let r = new RegExp(`(?:(?!${nextWord}).)*`);
      let m = r.exec(autocomplete.innerHTML)
      let t = [...wordsToCompare]
      t.splice(wordsToCompare.indexOf(nextWord), 1);
      suggestions = t;
      let suggestion_block = ``;
      suggestions.forEach(e => {
        suggestion_block += `<span class='suggestion'>${'&nbsp;'.repeat(m[0].trim().length-(checkAgainst.length-1))}${e}</span><br>`
      })
      if(suggestions.length < wordsToCompare.length-1) {
        suggestion_block += `<span class='suggestion'>${'&nbsp;'.repeat(m[0].trim().length-(checkAgainst.length-1))}...</span><br>`
      }
      autocomplete_suggestions.innerHTML = suggestion_block
      goToBottom(terminal_container);
    } else {
      autocomplete_suggestions.innerHTML = ''
    }
	}
})

terminal_input.addEventListener('keydown', (e) => {
  switch(e.key) {  
    case 'Backspace':
    case 'Delete':
      autocomplete.innerHTML = '';
      autocomplete_suggestions.innerHTML = ''
      return;
    case 'ArrowRight':
      if(autocomplete.innerText.length >= terminal_input.value.length) {
        e.preventDefault();
      }
    case 'Tab':
      e.preventDefault();
      terminal_input.value = autocomplete.innerText;
      return;
    case 'ArrowLeft':
      if(autocomplete.innerText.length >= terminal_input.value.length && terminal_input.value.split(' ').length>1) {
        e.preventDefault();
        terminal_input.value = terminal_input.value.split(' ').slice(0, -1).join(' ');
      }
      return;
    /*
    case 'ArrowUp':
      e.preventDefault();
      if(suggestions.length) {
        terminal_input.value = autocomplete.innerText.split(' ').slice(0,-1).join(' ')+ ' ' + suggestions.at(1);
        return;
      }
    case 'ArrowDown':
      e.preventDefault();
      if(suggestions.length) {
        terminal_input.value = autocomplete.innerText.split(' ').slice(0,-1).join(' ')+ ' ' + suggestions.at(0);
        return;
      }
    */
    case ' ': {
      if(terminal_input.value.at(-1) == ' ') {
        e.preventDefault();
      }
      break;
    } 
    case 'Enter': {
      e.preventDefault()
      let cmd = terminal_input.value.toLowerCase().match(/\w+/g).filter(word => !wordsFilter.includes(word))
      if(!cmd) { return; }
      while(buffer.next() !== undefined) {};
      buffer.push(cmd)
      switch (cmd[0]) {
        case 'clear':
          clearLog();
          break;
          default: {
            let CmdEvent = new CustomEvent('cmd', { 
              detail: { value: cmd }
            });
            terminal_input.dispatchEvent(CmdEvent);
            // addToLog(cmd);
          }
        }
        clearInput();
        return;
      }
  }
})

// TERMINAL IO FUNCTIONS

function addToLog(output) {
  let id = `logId-${logId}`
  let wrap = document.createElement('div');
  let logDiv = terminal_log 
  let lastChild = logDiv.lastChild;
  if(logDiv.getElementsByClassName(id).length) {
    wrap = logDiv.getElementsByClassName(id)[0];
  } else {
    wrap.classList.add(id)
    wrap.classList.add('logSegment');
  }

  // console.debug(getTotalChildrenHeights(terminal_container), 'vs', document.getElementById("phaser_container").clientHeight);
  let div = document.createElement('div');
  if(!(output instanceof HTMLDivElement) ) {
    // if output is already a stringified div, don't create a nested one.
    if(output.slice(0,4) == '<div') {
      div.innerHTML = `${output}`;
      div = div.firstElementChild;
    } else {
      div.innerHTML = output;
    }
  }
  else {
    div = output;
  }
  /*;
  if(div.classList.contains('input')) {
    logDiv = terminal_log_input;
  } else {
    logDiv = terminal_log_output;
  }*/

  div.classList.add(`logEntry`);
  div.classList.add(id)
  try {
    let divText = div.innerText.replaceAll(/\s/g, "")
    let lastChildText = lastChild.innerText.replaceAll(/\s/g, "")
    let lastLastChildText = lastChild.lastChild.innerText.replaceAll(/\s/g, "")
    if(divText == lastChildText || divText == lastLastChildText) {
      blink(lastChild);
    }
    else {
      wrap.appendChild(div);
      logDiv.appendChild(wrap);
      logCount++;
    }
  } catch (error) {
    console.debug(error)
    wrap.appendChild(div);
    logDiv.appendChild(wrap);
    logCount++;
  }
/*
  while(getTotalChildrenHeights(terminal_container) > getCanvasHeight() && logCount > 0 && terminal_container.children.length) {
    logDiv.firstChild.remove();
    // console.debug('trimming log to make room! bigger than canvas currently')
    logCount--;
  }*/
  if(isOverflown(terminal_container)) {
    // toBottomBtn.style.display = 'block';
    goToBottom(terminal_container)
  }
}

function logOutput(output) {
  let div = document.createElement('div');
  // output = colorize(output, rgbaOutput);
  div.innerHTML = output;
  // div = div.firstElementChild;
  div.classList.add('output');
  addToLog(div);
}

function logInput(input) {
  let div = document.createElement('div');
  // input = colorize(input, rgbaInput);
  div.innerHTML = input;
  // div = div.firstElementChild;
  div.classList.add('input');
  addToLog(div);
}

function logError(error) {
  let div = document.createElement('div');
  // error = colorize(error, rgbaError);
  div.innerHTML = error
  // div = div.firstElementChild;
  div.classList.add('error');
  addToLog(div);
}

function clearLog() {
  terminal_log.innerHTML = '';
  logCount = 0;
}

function getTotalChildrenHeights(element) {
  let totalHeight = 0;
  for(let i = 0; i < element.children.length; i++) {
    totalHeight += element.children[i].clientHeight; // true = include margins
  }
  return totalHeight;
}

function colorize(output, color) {
  return `<div class='colorized' style="background-color: ${color}">${output}</div>`
}

function wrapCmd(cmd) {
  let cmdArr = cmd.split(' ')
  if(cmdArr.length > 1) {
    let r = ''
    cmdArr.forEach(e => {
      let wrapped = wrapCmd(e);
      if(e.at(-1) == ',') {
        wrapped = `${wrapCmd(e.slice(0, e.length-1))},`;
      }
      r += `${wrapped} `;
    });
    return r.trimEnd();
  }
  let i = 0;
  let classList = `cmd ${cmd} `
  for(i; i<wordsAllArrays.length; i++) {
      if(wordsAllArrays[i].includes(cmd)) {
        classList += `${wordsAllArraysStrings[i]}`;
        break;
      }
  }
  return `<span class='${classList}'>${cmd}</span>`
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
      logOutput(exception_if);
      return;
    }
    encased += ` ${word}`;
    word = input_arr[i];
    i++; 
  } encased += ` ${word.slice(0, -1)}`;
  return encased
}


async function blink(e = document.getElementById('id')) {
  e.classList.remove('old')
  setTimeout(function() {
     // e.style.display = (e.style.display == 'none' ? '' : 'none');
     e.classList.add('blink');
  }, 200);
  setTimeout(function() {
     // e.style.display = (e.style.display == 'none' ? '' : 'none');
     e.classList.remove('blink')
  }, 800);
}

function shuffleArrayButFirst(array) {
  for (let i = array.length - 1; i > 1; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

function startNewLogSegment() {
  Array.from(terminal_log.children).forEach( e => {
    if(e.classList.contains('logSegment')) {
      e.classList.add('old');
    }
  })
  logId++;
}

function goToBottom(element=terminal_log.lastChild){
  if(isOverflown(element)) {
    element.scrollTop = element.scrollHeight - element.clientHeight;
  }
}

function isOverflown(element) {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}