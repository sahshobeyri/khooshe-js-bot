const MongoClient = require('mongodb').MongoClient;

// const url = 'mongodb://localhost:27017';
const url = 'khooshe-bot-db.sahshobeyri.svc:27017';
const dbName = 'KhoosheDB';

let db;

MongoClient.connect(url, (err, client) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  }
}).then();

module.exports = db;
