const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
  id: 10
};

var token = jwt.sign(data, 'abc123');
console.log(token);
var decoded = jwt.verify(token, 'abc123');
console.log(decoded);

// var message = 'I am user number 3';
// var hash = SHA256(message).toString();
// console.log(`message: ${message}`);
// console.log(`hash: ${hash}`);

// var data = {
//   id: 4
// };

// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// };

// var resultToken = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

// if(token.hash === resultToken){
//   console.log('Trust');
// } else{
//   console.log('Do not trust');
// }