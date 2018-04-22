const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

  var password = 'abc123';
  var usedToLogin = 'abc123';

  bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(password,salt,(err,hashed)=>{
        console.log(hashed);

        bcrypt.compare(usedToLogin, hashed, function(err, res) {
          if(res)
          console.log(res);
          else
          console.log(err);
      });
    })
  });


// var data = {
//   id:10
// };
//
// var token = jwt.sign(data,'123abc');
// console.log('token ' + token + ' decode : ');
// var decode = jwt.verify(token,'123abc');
// console.log(decode);
// if(decode.id===data.id)
// console.log('matched : '+ decode)
// else {
//   console.log('not matched');
// }
// var message = 'i m a user number 3';
// var hash = SHA256(message).toString();
//
// console.log(`message : ${message}`)
// console.log(`hash : ${hash}`);
