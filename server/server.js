const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

const Todo = mongoose.model('Todo', { 
  text: {
    type: String
  }, 
  completed: {
    type: Boolean
  },
  completed_at: {
    type: Number
  }
});

var haveLunch = new Todo({ 
  text: 'Eat Lunch',
});

haveLunch.save().then(function fullfilled(doc){
  console.log('Save Todo', doc);
}, function rejected(error){
  console.log(error);
});

var doShopping = new Todo({
  text: 'Go shooping',
  completed: true,
  completed_at: new Date()
});

doShopping.save().then((doc) => {
  console.log(JSON.stringify(doc, undefined, 2));
}, (error) => {
  console.log(error);
});