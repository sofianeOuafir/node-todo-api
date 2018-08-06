require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');
const port = process.env.PORT;

var app = express();
app.listen(port, () => {
  console.log(`Starting on port ${port}`);
});

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  new Todo({
    text: req.body.text,
    _creator: req.user._id
  }).save().then((todo) => {
    res.send({todo});
  }, (error) => {
    res.status(400).send(error);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({_creator: req.user._id}).then((todos) => {
    res.send({todos});
  }, (error) => {
    res.status(400).send(error);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  } 

  Todo.findOne({
    _id: id, 
    _creator: req.user._id
  })
  .then((todo) => {
    if(!todo){
      return res.status(404).send();
    }

    res.status(200).send({todo});
  }).catch((e) => res.status(400).send());
});

app.delete('/todos/:id', authenticate, async (req, res) => {
  try{
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
      return res.status(404).send();
    }
  
    var todo = await Todo.findOneAndRemove({_id: id, _creator: req.user._id});
    if(!todo){
      return res.status(404).send();
    }
    res.send({todo});
  } catch (e){
    res.status(400).send();
  }
});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({
      _id: id, 
      _creator: req.user._id
    }, body, {new: true}).then((todo) => {
    if(!todo){
      res.status(404).send();
    }

    res.send({todo});
  }).catch((err) => res.status(400).send());

});

app.post('/users', async (req, res) => {
  try{
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
    await user.save();
    var token = await user.generateAuthToken();
    res.header('x-auth', token).send({user});
  } catch(e) {
    res.status(400).send(e);
  }
});

app.get('/users/me', authenticate, (req, res) => {
  res.send({
    user: req.user
  });
});

app.post('/users/login', async (req, res) => {
  try{
    var {email, password} = req.body;
    var user = await User.findByCredentials(email, password);
    var token = await user.generateAuthToken();
    res.header('x-auth', token).send({user});
  } catch(e){
    res.status(400).send(e);
  }
});

app.delete('/users/me/token', authenticate, async (req, res) => {
  var {user, token} = req;
  try {
    await user.removeToken(token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});
  
module.exports = {
  app
};

