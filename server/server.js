
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
app.listen(3000, () => {
  console.log('Starting on port 3000');
});

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  new Todo({
    text: req.body.text
  }).save().then((doc) => {
    res.send(doc);
  }, (error) => {
    res.status(400).send(error);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send(todos);
  }, (error) => {
    res.status(400).send(error);
  });
});

module.exports = {
  app
};