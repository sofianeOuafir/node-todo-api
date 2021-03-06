const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {seedTodos, seedUsers, populateUsers, populateTodos} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test POST/todos interface';
    request(app)
      .post('/todos')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
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
      .set('x-auth', seedUsers[0].tokens[0].token)
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
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1)
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Todo.find({_creator: seedUsers[0]._id}).then((todos) => {
          expect(todos.length).toBe(1);
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
          .set('x-auth', seedUsers[0].tokens[0].token)
          .expect(200)
          .expect((res) => {
            expect(res.body.todo._id).toEqual(seedTodos[0]._id.toHexString());
          })
          .end(done);
      });
    });

    describe('The todo do not belong to the authenticated user', () => {
      it('should return a 404 status', (done) => {
        request(app)
          .get(`/todos/${seedTodos[1]._id}`)
          .set('x-auth', seedUsers[0].tokens[0].token)
          .expect(404)
          .end(done);
      });
    });

    describe('The todo has not been found', () => {
      it('should return a 404 status', (done) => {
        var id = new ObjectID();
        request(app)
          .get(`/todos/${id}`)
          .set('x-auth', seedUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
      });
    });
  });

  describe('The id is not valid', () => {
    it('should return a 404 status', (done) => {
      request(app)
        .get(`/todos/1`)
        .set('x-auth', seedUsers[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
  });
});

describe('DELETE /todos/:id', () => {
  describe('the id is valid', () => {
    describe('the todo exist in db', () => {
      it('should return the todo with a 200 OK status', (done) => {
        request(app)
          .delete(`/todos/${seedTodos[0]._id}`)
          .set('x-auth', seedUsers[0].tokens[0].token)
          .expect(200)
          .expect((res) => {
            expect(res.body.todo._id).toEqual(seedTodos[0]._id.toHexString())
          })
          .end((err, res) => {
            if(err){
              return done(err);
            }
            
            Todo.findById(seedTodos[0]._id.toHexString()).then((todo) => {
              expect(todo).toBeNull();
              done();
            }).catch((e) => done(e));
          });
      });
    });

    describe('the todo exist in db but do not belong to the authenticated user', () => {
      it('should return a 404 status', (done) => {
        request(app)
          .delete(`/todos/${seedTodos[0]._id}`)
          .set('x-auth', seedUsers[1].tokens[0].token)
          .expect(404)
          .end((err, res) => {
            if(err){
              return done(err);
            }
            
            Todo.findById(seedTodos[0]._id.toHexString()).then((todo) => {
              expect(todo).not.toBeNull();
              done();
            }).catch((e) => done(e));
          });
      });
    });

    describe('the todo do not exist in db', () => {
      it('should return a 404 status', (done) => {
        var id = new ObjectID();
        request(app)
          .delete(`/todos/${id}`)
          .set('x-auth', seedUsers[0].tokens[0].token)
          .expect(404)
          .end(done);
      });
    });
  });

  describe('the id is not valid', () => {
    it('should return a 404 status', (done) => {
      request(app)
      .delete(`/todos/1`)
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
    });
  });
});

describe('PATCH /todos/:id', () => {
  describe('Update todo to be completed', () => {
    it('should update the todo to be completed and set completedAt ', (done) => {
      var id = seedTodos[0]._id.toHexString();
      var text = 'yo';
      var completed = true;
      request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', seedUsers[0].tokens[0].token)
        .send({
          text,
          completed
        })
        .expect(200)
        .expect((res) => {
          var todo = res.body.todo;
          expect(todo).toMatchObject({
            text,
            _id: id,
            completed
          });
          expect(typeof todo.completedAt).toBe('number');
        })
        .end(done);

    });
  });

  describe('Update todo tp be completed that do not belong to the authenticated user', () => {
    it('should not update the todo to be completed and return 404 status', (done) => {
      var id = seedTodos[0]._id.toHexString();
      var text = 'yo';
      var completed = true;
      request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', seedUsers[1].tokens[0].token)
        .send({
          text,
          completed
        })
        .expect(404)
        .end(done);
    });
  });

  describe('Update todo to not be completed', () => {
    it('should update the todo to not be completed and set completedAt to be null', (done) => {
      var id = seedTodos[1]._id.toHexString();
      var text = 'Something';
      var completed = false;
      request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', seedUsers[1].tokens[0].token)
        .send({
          text,
          completed
        })
        .expect((res) => {
          expect(res.body.todo).toMatchObject({
            text,
            _id: id,
            completed,
            completedAt: null
          })
        })
        .end(done);
    });
  });
});

describe('GET /users/me', () => {
  it('should return 200 OK when user is authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(200)
      .expect((req) => {
        expect(req.body.user).toMatchObject({
          _id: seedUsers[0]._id.toHexString(),
          email: seedUsers[0].email
        });
      })
      .end(done);
  });

  it('should return 401 when user is not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'sofiane@example.com';
    var password = '123mnb!';
    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeDefined();
        var user = res.body.user;
        expect(user.email).toEqual(email);
        expect(user._id).toBeDefined();
      })
      .end((err) => {
        if(err){
          return done(err);
        }

        User.findOne({email}).then((doc) => {
          expect(doc.tokens[0].token).toBeDefined();
          expect(doc.tokens[0].access).toBe('auth');
          expect(doc.password).toBeDefined();
          expect(doc.password).not.toEqual(email);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation error if request is invalid', (done) => {
    var email = 'email';
    var password = '';

    request(app)
      .post('/users')
      .send({email,password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    var email = seedUsers[0].email;
    var password = '123mnb!';
    request(app)
      .post('/users')
      .send({email,password})
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    var {email, password} = seedUsers[1];
    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeDefined();
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user.tokens[1].token).toEqual(res.headers['x-auth']);
          expect(user.tokens[1].access).toBe('auth');
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    var {email} = seedUsers[1];
    var password = seedUsers[1].password + '1';
    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).not.toBeDefined();
      })
      .end((err, res) => {
        if (err){
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if(err){
          return done(err);
        }

        User.findById(seedUsers[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
})