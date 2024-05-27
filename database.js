// const MongoClient = require('mongodb').MongoClient;
//
// // const url = 'mongodb://localhost:27017';
// const url = 'mongodb://khooshe-bot-db.sahshobeyri.svc:27017';
// // const url = 'khooshe-bot-db.sahshobeyri.svc:27017';
// const dbName = 'KhoosheDB';
//
// let db;
//
// console.log("I AM DB CODE!")
//
// MongoClient.connect(url, (err, client) => {
//   if (err) {
//     console.log("EROROE DB")
//     console.error(err);
//   } else {
//     console.log('Connected to MongoDB');
//     db = client.db(dbName);
//   }
// }).then();
//
// module.exports = db;

const { MongoClient } = require("mongodb");
require('dotenv')

const {DB_PASS} = process.env;

// Replace the uri string with your connection string.
const url = "khooshe-bot-db.sahshobeyri.svc"
const uri = `mongodb+srv://root:${DB_PASS}@${url}?retryWrites=true&writeConcern=majority`;

const client = new MongoClient(uri);
console.log("CREATED new MongoClient(uri)")

async function run() {
  try {
    await client.connect();

    const database = client.db('db');
    console.log(database)
    // const movies = database.collection('movies');

    // Query for a movie that has the title 'Back to the Future'
    // const query = { title: 'Back to the Future' };
    // const movie = await movies.findOne(query);

    // console.log(movie);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);