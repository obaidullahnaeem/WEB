let text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let length = text.length;  // Output: 26

let texti = "HELLO WORLD";
let char = texti.charAt(0);  // Output: "H"
let letter = texti.at(2);  // Output: "L"


//  at(position) Method       gives the output of that position
//  charAt(position) Method   gives only character at that position
//  charCodeAt(position) Method


// SLICING:  
// slice(start, end)
text.slice(0, 5); // Output: "HELLO"
text.slice(-5);  // Output: "WORLD"

// substring(start, end)
// substr(start, length)

//         FILTER 
const arri = [1, 2, 3, 4, 5];
function isOdd(num) {
  return num % 2 !== 0; }

const oddNums = arri.filter(isOdd);
// [1, 3, 5]  loop over check if true then keep in new array


//        MAP  →  "Change every item"
const doubledNums = arri.map(num => num * 2);
// [2, 4, 6, 8, 10]  loop over and apply function to each item



//       REDUCE  → "Combine everything into one result"
const arr=[1, 2, 3, 4, 5];
const productOfAllNums = arr.reduce((total, currentItem) => {
  return total * currentItem; }, 1);