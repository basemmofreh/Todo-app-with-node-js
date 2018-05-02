const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const Todo = require('./../models/todo');
const User = require('./../models/user');
const {todos,populateTodos,users,populateUsers} = require('./seed/seed');
// debugger;
beforeEach(populateUsers);
beforeEach(populateTodos);


describe('POST /todos',()=>{

  it('should create new Todo',(done)=>{
    var text = 'im waiting for thermal pad to be delivered';
      request(app)
      .post('/todos')
      .set('x-auth',users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res)=>{
        expect(res.body.text).toBe(text);
      })
      .end((err,res)=>{
          if(err)
          {
            return done(err);
          }

          Todo.find({text}).then((todos)=>{

            // expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          }).catch((e)=>done(e));
      });
  });

  it('shouldnt create Todo with invalid body data',(done)=>{
    var dta = '';
      request(app)
      .post('/todos')
      .set('x-auth',users[0].tokens[0].token)
      .send({dta})
      .expect(404)
      .end((err,res)=>{
        if(err)
          return done(err);

          Todo.find().then((todos)=>{
            expect(todos.length).toBe(2);
            done();
          }).catch((e)=>done(e));

      })
  })
});
describe('GET /todos',()=>{
  it('should return Todo doc' ,(done)=>{
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .set('x-auth',users[0].tokens[0].token)
    .expect(200)
    .expect((res)=>{
        expect(res.body.user.text).toBe(todos[0].text);
    })
    .end(done);
  })
})
describe('DELETE /todos/:id',()=>{
    it('should remove a todo ',(done)=>{
      var hexId = todos[1]._id.toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth',users[1].tokens[0].token)
        .expect(200)
        .expect((res)=>{
          expect(res.body.user._id).toBe(hexId);
        })
        .end((err,res)=>{
          if(err)
            return done(err);

          Todo.findById(hexId).then((res)=>{
            expect(res).toBe(null);
            done();
          }).catch((e)=>done(e));
        })
    })

    it('should return 404 if todo not found',(done)=>{
      var hexId = new ObjectID().toHexString();
      request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth',users[0].tokens[0].token)
      .expect(404)
      .end(done)
    })
    it('should return 500 if object id is invalid',(done)=>{
      request(app)
      .delete('/todos/123abc')
      .set('x-auth',users[0].tokens[0].token)
      .expect(500)
      .end(done)
    })
})
describe('PATCH /todos/:id',()=>{
  it('should update the todo',(done)=>{
    var hexId = todos[0]._id.toHexString();
    var text = 'this should be the new text';
    request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth',users[0].tokens[0].token)
    .send({
        completed:true,
        text
    })
    .expect(200)
    .expect((res)=>{
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);

    })
    .end(done)
  })
  it('should not update the todo created by another user',(done)=>{
    var hexId = todos[0]._id.toHexString();
    var text = 'this should be the new text';
    request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth',users[1].tokens[0].token)
    .send({
        completed:true,
        text
    })
    .expect(404)
    .end(done)
  })
  it('should clear completedAt when todo is not completed',(done)=>{
    var hexId = todos[1]._id.toHexString();
    request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth',users[1].tokens[0].token)
    .send({completed:false})
    .expect(200)
    .expect((res)=>{
      expect(res.body.todo.text).toBe(todos[1].text)
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toBe(null);
    })
    .end(done)
  })
})
describe('GET /todos/:id',()=>{
    it('should return todo doc',(done)=>{
      var todo = todos[0]._id.toHexString();
        request(app)
        .get(`/todos/${todo}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
          expect(res.body.user.text).toBe(todos[0].text);
        })
        .end(done);
    })

    it('should not return todo doc created by other user',(done)=>{
      var todo = todos[1]._id.toHexString();
        request(app)
        .get(`/todos/${todo}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(404)
        .end(done);
    })



})
describe('GET /users/me',()=>{
  it('should get authorized email',(done)=>{
    request(app)
      .get('/users/me')
      .set('x-auth',users[0].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body._id).toBe(users[0]._id.toHexString());
      })
      .end(done)
  });

  it('should return 401  if not authenticated',(done)=>{
      request(app)
      .get('/users/me')
      .expect(401)
      .expect((res)=>{
        expect(res.body).toEqual({});
      })
      .end(done);

  })

})
describe('POST /users',()=>{
  it('should create a user ',(done)=>{
    var email= 'Basemmofreh@gmail.com';
    var password = 'asdasda2323s';

    request(app)
      .post('/users')
      .send({email,password})
      .expect(200)
      .expect((res)=>{
        expect(res.body.email).toBe(email);
        expect(res.body.password).not.toBe(password);
      })
      .end(done);
  })

  it('should return validation errors if request invalid',(done)=>{
      var email = 'asdasdasd';
      var password='1a';
      request(app)
        .post('/users')
        .send({email,password})
        .expect(400)
        .expect((res)=>{
          console.log(res.body.errors.email.message);
        })
        .end(done);
  })

  it('should not create a user if email is in use',(done)=>{
      var email = users[0].email;
      var password = 'asdasdasd';
      request(app)
        .post('/users')
        .send({email,password})
        .expect(400)
        .expect((res)=>{
            console.log(res.body.errmsg)
        })
        .end(done);
  })

})
describe('POST /users/login',()=>{
    it('should login user and return auth token',(done)=>{
        request(app)
          .post('/users/login')
          .send({email:users[0].email,password:users[0].password})
          .expect(200)
          .expect((res)=>{
              expect(res.headers['x-auth']).toBeTruthy();
          })
          .end((err,res)=>{
            if(err)
              return done(err);
            User.findById(users[0]._id).then((user)=>{
                expect(user.toObject().tokens[1]).toMatchObject({
                  access:'auth',
                  token: res.headers['x-auth']
                });
                done();
            }).catch((e)=>done(e));
          })
    })

    it('should reject invalid login',(done)=>{
        request(app)
          .post('/users/login')
          .send({email:users[0].email+'a',password:users[0].password+'1'})
          .expect(400)
          .expect((res)=>{
            expect(res.headers['x-auth']).toBeFalsy();
          })
          .end((err,res)=>{
              if(err)
                return done(err)
              User.findById(users[0]._id).then((user)=>{
                  expect(user.tokens.length).toBe(1);
                  done();
              }).catch((e)=>done(e));
          });
    })
})
describe('DELETE /users/me/token',()=>{
    it('should delete authorized token',(done)=>{
      request(app)
        .delete('/users/me/token')
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)

        .end((err,res)=>{
          if(err)
            done(err);
          User.findById(users[0]._id).then((user)=>{
            expect(user.tokens.length).toBe(0);
              done();
          }).catch((e)=>done(e))

        });
    })
})
