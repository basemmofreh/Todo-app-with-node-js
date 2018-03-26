var mongoose = require('mongoose');
var schema = mongoose.Schema;

var user = new schema({
  email:{
    type:String,
    required:true,
    trim:true,
    minlength:1
  }
});


module.exports = mongoose.model('users',user);
