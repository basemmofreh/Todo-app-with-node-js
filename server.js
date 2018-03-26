var express = require('express');

var bodyParser = require('body-parser');
var {mongoose} = require('./db/mongoose');
var user = require('./models/user');
var Todo = require('./models/todo');
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


app.post('/todos',(req,res)=>{
  var todo = new Todo({text:req.body.text});

  todo.save().then((doc)=>{
    res.send(doc);
  }).catch((e)=>{
    res.status(404).send(e);
  })
});

app.get('/',(req,res)=>{
  res.status(200).send("welcome to todos app ");
})

app.listen('3000',function(){
  console.log('live on port 3000');
})


module.exports = {app};
