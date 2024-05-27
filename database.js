const MongoClient = require('mongodb').MongoClient;

// const url = 'mongodb://localhost:27017';
const url = 'mongodb://khooshe-bot-db.sahshobeyri.svc:27017';
// const url = 'khooshe-bot-db.sahshobeyri.svc:27017';
const dbName = 'KhoosheDB';

let db;

console.log("I AM DB CODE!")

MongoClient.connect(url, (err, client) => {
  if (err) {
    console.log("EROROE DB")
    console.error(err);
  } else {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  }
}).then();

module.exports = db;