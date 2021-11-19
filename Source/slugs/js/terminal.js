let words = ['move', 'if', 'for', 'help', 'abracadabra', 'clear']

var logCount = 0;
var logMax = 5;
let terminal_log = document.getElementById('terminal_log');
let autocomplete = document.getElementById('autocomplete');
let terminal_input = document.getElementById('terminal_input');


function clear() {
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
    autocomplete.innerHTML = input;
    
    let regex = new RegExp('^' + input + '.*', 'i');
    
    for(let i = 0; i < words.length; i++){
    	if(words[i].match(regex)){
      	autocomplete.innerHTML += words[i].slice(input.length, words[i].length);
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
          clear();
        }
        return;
    }
    if(e.key == 'Enter') {
      let cmd = terminal_input.value
      while(buffer.next() !== undefined) {};
      buffer.push(cmd)
      if(cmd=='clear') {
        clearLog();
        clear();
        return;
      } else if(cmd=='help') {
        addToOutput(`hello! the commands that are available are <span class='cmd'>${words}</span>.`)
      } else if(!words.includes(cmd)) {
        addToOutput(`error: '<span class='cmd'>${cmd}</span>' is not a known command. try a different one, or try typing '<span class='cmd'>help</span>'!.`)
      }

      let CmdEvent = new CustomEvent('cmd', { 
        detail: { value: cmd }
      });
      terminal_input.dispatchEvent(CmdEvent);
      // addToLog(cmd);
      clear()
    }
})


function addToLog(cmd) {
  logCount++;
  if(logCount > logMax) {
    terminal_log.firstChild.remove();
  }
  let p = document.createElement('p');
  p.innerHTML = cmd;
  terminal_log.appendChild(p);
}

function addToOutput(cmd) {
  logCount++;
  if(logCount > logMax) {
    terminal_log.firstChild.remove();
  }
  let p = document.createElement('p');
  p.innerHTML = cmd;
  terminal_log.appendChild(p);
}

function clearLog() {
  terminal_log.innerHTML = '';
  logCount = 0;
}