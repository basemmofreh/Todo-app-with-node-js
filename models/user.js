var mongoose = require('mongoose');
var schema = mongoose.Schema;
var validator = require('validator');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var user = new schema({
  email:{
    type:String,
    required:true,
    trim:true,
    minlength:1,
    unique:true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password:{
    type:String,
    required: true,
    minlength: 6
  },
  tokens:[{
    access:{
      type: String,
      required: true,
    },
    token:{
      type: String,
      required: true,
    }
  }]

});
user.methods.toJSON = function(){
  var self = this;
  var userObject = self.toObject();
  return _.pick(userObject,['_id','email']);
}
user.methods.generateAuthToken = function(){
  var self = this;
  var access = 'auth';
  var token = jwt.sign({_id:self._id.toHexString(),access},'abc123').toString();

  self.tokens.push({access,token});
return self.save().then(()=>{
    return token;
  })
};
user.statics.findByToken = function(token) {
    var user = this;
    var decoded;

    try {
      decoded = jwt.verify(token,'abc123');
    }
    catch(e){
      // return new Promise = ((resolve,reject)=>{
      //   reject();
      // })
      //same meaning as above
      return Promise.reject();
    }
    return user.findOne({
      '_id': decoded._id,
      'tokens.token':token,
      'tokens.access':'auth'
    })
}
user.pre('save',function(next){
    var self = this;
    if(self.isModified('password'))
      {
        bcrypt.genSalt(10,(err,salt)=>{
          bcrypt.hash(self.password,salt,(err,hashed)=>{
              self.password = hashed;
              next();
          })
        })
      }
    else {
      next();
    }
});
module.exports = mongoose.model('users',user);
