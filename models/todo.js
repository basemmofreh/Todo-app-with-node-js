var mongoose = require('mongoose');
var schema = mongoose.Schema;

var Todo = new schema({
  text:{
    type:String,
    required:true,
    minlength:1,
    trim:true
  },
  completed:{
    type:Boolean,
    default:false,
  },
  completedAt:{
    type:Number,
    default:null
  }
});


module.exports = mongoose.model('Todo',Todo);
