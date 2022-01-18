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