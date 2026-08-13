// const string = "The revolution will not be televised.";

// const badString = string;
// console.log(badString);


// console.log(string);

// const single = 'Single quotes';
// const double = "Double quotes";
// const backtick = `Backtick`;

// console.log(single);
// console.log(double);
// console.log(backtick);


// Embedding JavaScript
// const name = "Chris";
// const greeting = `Hello, ${name}`;
// console.log(greeting); 
//  Result>>> "Hello, Chris"

const button = document.querySelector("button");
// constant named button that is assigned to the first button element in the document

function greet() {
  const name = prompt("What is your name?");
  const greeting = document.querySelector("#greeting");
//   
  greeting.textContent = `Hello ${name}, nice to see you!`;
}

button.addEventListener("click", greet);