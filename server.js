var express = require('express');
var config = require('./models/config');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');
var User = require('./models/user');
var Todo = require('./models/todo');
const {authenticate} = require('./middleware/authenticate');
var _ = require('lodash');
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const port = process.env.PORT;


app.get('/users/me',authenticate,(req,res)=>{
  res.send(req.user);
});
app.post('/users/login',(req,res)=>{
    var body = _.pick(req.body,['email','password']);
    User.findbyCrendential (body.email,body.password).then((user)=>{
      return  user.generateAuthToken().then((token)=>{
            res.header('x-auth',token).send(user);
        })
      res.status(200).send(user)
    }).catch((e)=>res.status(400).send(e));
})
app.post('/todos',authenticate,(req,res)=>{
  var todo = new Todo({
    _creator:req.user._id,
    text:req.body.text
  });

  todo.save().then((doc)=>{
    res.send(doc);
  }).catch((e)=>{
    res.status(404).send(e);
  })
});
app.get('/todos',authenticate,(req,res)=>{
  Todo.find({_creator:req.user._id}).then((todos)=>{
      res.status(200).send(todos);
  }).catch((e)=>{
    res.status(400).send(e);
  })
})
app.get('/todos/:id',authenticate,(req,res)=>{
    var userId = req.params.id;

    if(!ObjectID.isValid(userId)){
      res.status(400).send("BAD REQUEST INVALIED ID");

    }
    Todo.findOne({_id:userId,_creator:req.user._id}).then((user)=>{
      if(!user)
      res.status(404).send("<h1>USER NOT FOUND</h1>");
      else
      res.status(200).send({user});
    }).catch((e)=>res.status(400).send());
});
app.delete('/todos/:id',authenticate,(req,res)=>{
  let userId = req.params.id;
  if(ObjectID.isValid(userId)&&userId!=""){
    Todo.findOneAndRemove({
      _id:userId,
      _creator:req.user._id
    }).then((user)=>{
      if(!user)
      {
        res.status(404).send()
      }
      else  res.status(200).send({user});
    }).catch((e)=>{
      throw new Error(e);
    })
  }
  else {
        res.status(500).send("invalied user id ");
  }

});
app.patch('/todos/:id',authenticate,(req,res)=>{
    var id = req.params.id;
      //_.pick is a lodash function allows certain variables only to be stored in var body if they exist
      //this used to prevent the user from updating inapproperiate fields in the database
    var body = _.pick(req.body,['text','completed']);
    console.log('body' + body.completed);
    if(!ObjectID.isValid(id))
      {
        return res.status(404).send();
      }
    if(_.isBoolean(body.completed)&&body.completed)
      {
        body.completedAt = new Date().getTime();
      }
    else{
      body.completed = false;
      body.completedAt=null;
    }

    Todo.findOneAndUpdate({_id:id,_creator:req.user._id},{$set:body},{new:true}).then((todo)=>{
        if(!todo)
          res.status(404).send();
        else {
          res.status(200).send({todo});
        }
    }).catch((e)=>res.status(400).send())
})
app.post('/users',(req,res)=>{
    var body = _.pick(req.body,['email','password']);
    var user = new User(body);

    user.save().then((user)=>{
      return user.generateAuthToken();
    }).then((token)=>{
      res.header('x-auth',token).send(user)
    }).catch((e)=>res.status(400).send(e));
});
app.delete('/users/me/token',authenticate,(req,res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send("logged out succussfuly");
    },()=>{
        res.status(400).send("unable to logout");
    }).catch((e)=>res.status(404).send(e));
})
app.listen(port,function(){
  console.log(`Live now on port ${port}`);
})


module.exports = {app};
