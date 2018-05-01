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

//.methods where we store instance methods , // toJSON default function you can override to change the return value of the mongoose model
user.methods.toJSON = function(){
  var self = this;
  var userObject = self.toObject();
  return _.pick(userObject,['_id','email']);
}
user.methods.removeToken = function(token){
    var self = this;
  return  self.update({
      $pull:{
        tokens:{
          token
        }
      }
    })
}
user.methods.generateAuthToken = function (){
    var self = this;
    var access = 'auth';
    var token = jwt.sign({_id:self._id.toHexString(),access},process.env.JWT_SECRET);

    self.tokens.push({access,token});
    return self.save().then(()=>{
        return token;
    })
}

//.statics where we store model methods
user.statics.findbyCrendential = function(email,password){
    var self = this;
    return self.findOne({email}).then((user)=>{
        if(!user)
        {
        return  Promise.reject();
      }
        return new Promise((resolve,reject)=>{
            bcrypt.compare(password,user.password,(err,res)=>{
                if(res)
                  resolve(user);
                else {
                  reject();
                }

            })
        })
    })
}
user.statics.findByToken = function(token) {
    var user = this;
    var decoded;

    try {
      decoded = jwt.verify(token,process.env.JWT_SECRET);
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
// pre build in function used to make change to data before saving it , in this case hashing password
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
