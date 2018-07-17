const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if(err){
    return console.log('We were unable to connect to mongodb server', err);
  }

  console.log('Connected to mongodb server');
  const db = client.db('TodoApp');

  // db.collection('Todos').find().count().then((count) => {
  //   console.log(`Todos count: ${count}`);
  // }, (err) => {
  //   console.log(err);
  // });

  db.collection('Users').find({
    name: 'Sofiane'
  }).toArray().then((docs) => {
    console.log(JSON.stringify(docs, undefined, 2));
  }, (err) => {
    console.log(err);
  });

  // client.close();
})