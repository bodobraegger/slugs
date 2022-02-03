//------------------------------------------------
// Guess the Number
//------------------------------------------------

// --- Start of the game ---
let smallestScore = 0;

function startGame() {
  console.clear();
  //   --- Reset the Game ---
  let guessNumber = 0;
  let numberOfGuesses = 0;
  let hiddenNumber = Math.floor(Math.random() * 10 + 1); //  Set up random guess number from 1 to 10

  console.log(hiddenNumber);
  console.log("=== Welcome to the Guessing Number Game ===");
  console.log("Think of a number 1 to 10.");

  // --- While the Game is Running ---
  while (hiddenNumber != guessNumber) {
    guessNumber = prompt("What is the number I am thinking of? ");

    if (!guessNumber) {
      alert("Game is over - that was not a number");
      break;
    } else if (hiddenNumber < guessNumber) {
      numberOfGuesses += 1;
      console.log("Guess Lower! Incorrect guesses:", numberOfGuesses);
      console.log();
    } else if (hiddenNumber > guessNumber) {
      numberOfGuesses += 1;
      console.log("Guess Higher! Incorrect guesses", numberOfGuesses);
      console.log();
    } else {
      //  --- Remember lowest score ---
      if (smallestScore > numberOfGuesses) {
        smallestScore = numberOfGuesses;
      }
      console.log("Smallest Score is", smallestScore);

      //  --- Show to player ---
      console.log();
      console.log("=== You are correct! Play again! ===");
      console.log("You had a total of", numberOfGuesses, "wrong guesses.");
    }
  }
}


function fizzbuzz(n=100, divisorA=3, divisorB=5) {
    let i = 1
    let output = ''
    addToLog(`fizzbuzz(${n}, ${divisorA}, ${divisorB})`)
    while(i<=n) {
        if (i%divisorA == 0 && i%divisorB == 0) {
            output += "FizzBuzz" + " "
        }  
        else if ((i%divisorA) == 0) {
            output += "Fizz" + " "               
        }
        else if ((i%divisorB) == 0) {
            output += "Buzz" + " "              
        }
        else {
            output += i + " "
        }
        i++
    }
    // you can ignore this :)
    addToLog(output)
}


function bigSum(n) {
    let threes = 0
    let notThrees = 0
    let i = 1
    while(i<=n) {
        if(i % 3 == 0) {
            threes += i
        }
        else {
            notThrees += i
        }
        i++;
    }
    return threes * notThrees
}