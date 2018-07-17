const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if(err){
    return console.log('We were unable to connect to mongodb server', err);
  }

  console.log('Connected to mongodb server');
  const db = client.db('TodoApp');

  // db.collection('Todos').findOneAndUpdate({
  //     text: 'Something to do'
  //   }, {
  //     $set: {
  //       completed: true
  //     }
  //   }, {
  //     returnOriginal: false
  //   }).then((results) => {
  //   console.log(`${results.value.text} todo has been completed`);
  // })

  db.collection('Users').findOneAndUpdate({
    name: 'Andrea'
  }, {
    $set: {
      name: 'Sofiane'
    },
    $inc: {
      age: 1
    }
  }, {
    returnOriginal: false
  }).then((result) => {
    console.log(result);
  });

});