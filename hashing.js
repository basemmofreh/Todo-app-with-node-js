const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
  id:10
};

var token = jwt.sign(data,'123abc');
console.log('token ' + token + ' decode : ');
var decode = jwt.verify(token,'123abc');
console.log(decode);
if(decode.id===data.id)
console.log('matched : '+ decode)
else {
  console.log('not matched');
}
// var message = 'i m a user number 3';
// var hash = SHA256(message).toString();
//
// console.log(`message : ${message}`)
// console.log(`hash : ${hash}`);
