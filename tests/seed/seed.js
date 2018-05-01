const {ObjectID}= require('mongodb');
const jwt = require('jsonwebtoken');

const Todo = require('./../../models/todo');
const User = require('./../../models/user');


const userOneId = new ObjectID();
const userTwoId = new ObjectID();


const users = [{
    _id:userOneId,
    email:"andrew@gmail.com",
    password:"hello world",
    tokens:[{
      access:'auth',
      token: jwt.sign({_id:userOneId,access:'auth'},process.env.JWT_SECRET).toString()
    }]
},{
    _id:userTwoId,
    email:"basemw@gmail.com",
    password:"hello world",
    tokens:[{
      access:'auth',
      token: jwt.sign({_id:userTwoId,access:'auth'},process.env.JWT_SECRET).toString()
    }]
}
]

const todos = [{
  _id:new ObjectID(),
  text:'buy new mercedes benz',
  _creator:userOneId
},{
  _id:new ObjectID(),
  text:'second test Todo',
  completed:true,
  completedAt:333,
  _creator:userTwoId
}];

const populateTodos =function(done){
  this.timeout(10000);
  Todo.remove({}).then(()=>{
    return Todo.insertMany(todos);

  }).then(()=>done());
};

//must set this timer for before each to work because arrow functions waits for a reject promise that doesn't happen thats why it causes exceeded 2000 ms this is a fix for this problem
/*For me the problem was actually the describe function, which when provided an arrow function, causes mocha to miss the timeout, and behave not consistently. (Using ES6)

since no promise was rejected I was getting this error all the time for different tests that were failing inside the describe block

so this how it looks when not working properly:*/
const populateUsers =function(done){
  this.timeout(10000);
  User.remove({}).then(()=>{
      var userOne = new User(users[0]).save();
      var userTwo = new User(users[1]).save();
      return Promise.all([userOne,userTwo]);
  }).then(()=>done());
};

module.exports = {todos,populateTodos,populateUsers,users};
