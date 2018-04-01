var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');
var user = require('./models/user');
var Todo = require('./models/todo');
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;


app.post('/todos',(req,res)=>{
  var todo = new Todo({text:req.body.text});

  todo.save().then((doc)=>{
    res.send(doc);
  }).catch((e)=>{
    res.status(404).send(e);
  })
});
app.get('/',(req,res)=>{
  Todo.find().then((todos)=>{
      res.status(200).send(todos);
  }).catch((e)=>{
    res.status(400).send(e);
  })
})
app.get('/todos/:id',(req,res)=>{
    var userId = req.params.id;

    if(!ObjectID.isValid(userId)){
      res.status(400).send("BAD REQUEST INVALIED ID");
    }
    Todo.find({_id:userId}).then((user)=>{
      if(!user)
      res.status(404).send("<h1>USER NOT FOUND</h1>");
      else
      res.status(200).send({user});
    }).catch((e)=>res.status(400).send);
});
app.delete('/todos/:id',(req,res)=>{
  let userId = req.params.id;
  if(ObjectID.isValid(userId)&&userId!=""){
    Todo.findByIdAndRemove(userId).then((user)=>{
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
app.listen(port,function(){
  console.log(`Live now on port ${port}`);
})


module.exports = {app};
