const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if(err){
    return console.log('We were unable to connect to mongodb server', err);
  }

  console.log('Connected to mongodb server');
  const db = client.db('TodoApp');


  // db.collection('Todos').findOneAndDelete({text: 'Wash dishes'}).then((result) => {
  //   console.log(result);
  // });

  // db.collection('Users').deleteMany({name: 'Sofiane'}).then((results) => {
  //   console.log(`${results.result.n} users deleted with success`);
  // });

  db.collection('Users').findOneAndDelete({_id: new ObjectID('5b4c32938550015d5bc0836e')}).then((result) => {
    console.log(`${result.value.name} deleted with success`);
  });

});