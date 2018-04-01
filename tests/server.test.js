const expect = require('expect');
const request = require('supertest');
const {app} = require('./../server');
const Todo = require('./../models/todo');
const {ObjectID} = require('mongodb');
debugger;
const todos = [{
  _id:new ObjectID(),
  text:'buy new mercedes benz'
},{
  _id:new ObjectID(),
  text:'second test Todo'
}];

beforeEach((done)=>{
  Todo.remove({}).then(()=>{
    Todo.insertMany(todos);
  }).then(()=>done());
});


describe('POST /todos',()=>{

  it('should create new Todo',(done)=>{
    var text = 'im waiting for thermal pad to be delivered';
      request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res)=>{
        expect(res.body.text).toBe(text);
      })
      .end((err,res)=>{
          if(err)
            return done(err);

          Todo.find({text}).then((todos)=>{
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          }).catch((e)=>done(e));
      });
  });

  it('shouldnt create Todo with invalid body data',(done)=>{
    var dta = '';
      request(app)
      .post('/todos')
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
    .expect(200)
    .expect((res)=>{

        expect(res.body.user[0].text).toBe(todos[0].text);
    })
    .end(done);
  })
})


describe('DELETE /todos/:id',()=>{
    it('should remove a todo ',(done)=>{
      var hexId = todos[1]._id.toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((res)=>{
          expect(res.body.user._id).toBe(hexId);
        })
        .end((err,res)=>{
          if(err)
            return done(err);

          Todo.findById(hexId).then((res)=>{
            expect(res).toBeNull();
            done();
          }).catch((e)=>done(e));
        })
    })

    it('should return 404 if todo not found',(done)=>{
      var hexId = new ObjectID().toHexString();
      request(app)
      .delete(`/todos/${hexId}`)
      .expect(404)
      .end(done)
    })
    it('should return 500 if object id is invalid',(done)=>{
      request(app)
      .delete('/todos/123abc')
      .expect(500)
      .end(done)
    })
})
