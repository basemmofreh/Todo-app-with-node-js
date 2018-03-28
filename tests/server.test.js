const expect = require('expect');
const request = require('supertest');
const {app} = require('./../server');
const todo = require('./../models/todo');
const {ObjectID} = require('mongodb');

const todos = [{
  _id:new ObjectID(),
  text:'buy new mercedes benz'
},{
  _id:new ObjectID(),
  text:'second test todo'
}];
// 
// beforeEach((done)=>{
//   todo.remove({}).then(()=>done());
// });

//
// describe('POST /todos',()=>{
//
//   it('should create new todo',(done)=>{
//     var text = 'im waiting for thermal pad to be delivered';
//       request(app)
//       .post('/todos')
//       .send({text})
//       .expect(200)
//       .expect((res)=>{
//         expect(res.body.text).toBe(text);
//       })
//       .end((err,res)=>{
//           if(err)
//             return done(err);
//
//           todo.find({text}).then((todos)=>{
//             expect(todos.length).toBe(1);
//             expect(todos[0].text).toBe(text);
//             done();
//           }).catch((e)=>done(e));
//       });
//   });
//
//   it('shouldnt create todo with invalid body data',(done)=>{
//     var dta = '';
//       request(app)
//       .post('/todos')
//       .send({dta})
//       .expect(404)
//       .expect((res)=>{
//         expect(res.body.message).toBe(dta);
//       })
//       .end((err,res)=>{
//         if(err)
//           return done(err);
//
//           todo.find().then((todos)=>{
//             expect(todos.length).toBe(2);
//             done();
//           }).catch((e)=>done(e));
//
//       })
//   })
// });
describe('GET /todos',()=>{
  it('should return todo doc' ,(done)=>{
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res)=>{

        expect(res.text).toBe(todos[0].text);
    })
    .end(done);
  })
})
