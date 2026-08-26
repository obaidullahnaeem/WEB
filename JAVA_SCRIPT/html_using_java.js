const container = document.querySelector("#container");

// 1. A <p> with red text
const redParagraph = document.createElement("p");
redParagraph.textContent = "Hey I’m red!";
redParagraph.style.color = "red";
container.appendChild(redParagraph);

// 2. An <h3> with blue text
const blueHeading = document.createElement("h3");
blueHeading.textContent = "I’m a blue h3!";
blueHeading.style.color = "blue";
container.appendChild(blueHeading);

// 3. A <div> with a black border and pink background
const pinkBox = document.createElement("div");
pinkBox.style.border = "1px solid black";
pinkBox.style.backgroundColor = "pink";

// Elements inside the <div>
const divHeading = document.createElement("h1");
divHeading.textContent = "I’m in a div";

const divParagraph = document.createElement("p");
divParagraph.textContent = "ME TOO!";

// Append child elements to the <div>
pinkBox.appendChild(divHeading);
pinkBox.appendChild(divParagraph);

// Append the <div> to the main container
container.appendChild(pinkBox);