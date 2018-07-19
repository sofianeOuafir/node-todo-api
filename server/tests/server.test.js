const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const seedTodos = [{
  _id: new ObjectID(),
  text: 'Something to do.'
}, {
  _id: new ObjectID(),
  text: 'Something to do number 2.'
}];

beforeEach((done) => {
  Todo.remove().then(() => {
    Todo.insertMany(seedTodos);
    done();
  });
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test POST/todos interface';
    request(app)
      .post('/todos')
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(seedTodos.length);
          done();
        }).catch((err) => done(err));
      });
  });
});

describe('GET /todos', () => {
  it('should return a list of todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(seedTodos.length)
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(seedTodos.length);
          done();
        }, (err) => {
          done(err)
        });
      });
  });
});

describe('GET /todos/:id', () => {
  describe('The id is valid', () => {
    describe('The todo has been found', () => {
      it('should return the todo with a 200 OK status', (done) => {
        request(app)
          .get(`/todos/${seedTodos[0]._id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.todo._id).toEqual(seedTodos[0]._id.toHexString());
          })
          .end(done);
      });
    });

    describe('The todo has not been found', () => {
      it('should return a 404 status', (done) => {
        request(app)
          .get(`/todos/1b1043bd0cc6f514302ef296`)
            .expect(404)
            .end(done);
      });
    });
  });

  describe('The id is not valid', () => {
    it('should return a 404 status', (done) => {
      request(app)
        .get(`/todos/1`)
          .expect(404)
          .end(done);
    });
  });
});
