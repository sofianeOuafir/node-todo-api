const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5b4f2fb035909a01f281a95f';
var userId = '5b4e223ed6d381e9a04cb5f4';

User.findById(userId).then((user) => {
  if(!user){
    return console.log('User not found.');
  }

  console.log(user);
}).catch((err) => console.log(err));
// Todo.find({
//   _id: id
// }).then((todos) => {
//   if(todos.length === 0){
//     return console.log('Todos not found');
//   }
//   console.log(todos);
// });

// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   if(!todo){
//     return console.log('Id not found');
//   }
//   console.log(todo);
// });

// Todo.findById(id).then((todo) => {
//   console.log(todo);
// });
