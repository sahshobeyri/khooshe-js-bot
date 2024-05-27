// // const MongoClient = require('mongodb').MongoClient;
// //
// // // const url = 'mongodb://localhost:27017';
// // const url = 'mongodb://khooshe-bot-db.sahshobeyri.svc:27017';
// // // const url = 'khooshe-bot-db.sahshobeyri.svc:27017';
// // const dbName = 'KhoosheDB';
// //
// // let db;
// //
// // console.log("I AM DB CODE!")
// //
// // MongoClient.connect(url, (err, client) => {
// //   if (err) {
// //     console.log("EROROE DB")
// //     console.error(err);
// //   } else {
// //     console.log('Connected to MongoDB');
// //     db = client.db(dbName);
// //   }
// // }).then();
// //
// // module.exports = db;
//
// // const { MongoClient } = require("mongodb");
// // require('dotenv')
// //
// // const {DB_PASS} = process.env;
// //
// // // Replace the uri string with your connection string.
// // const url = "khooshe-bot-db.sahshobeyri.svc"
// // const uri = `mongodb+srv://root:${DB_PASS}@${url}?retryWrites=true&writeConcern=majority`;
// //
// // const client = new MongoClient(uri);
// // console.log("CREATED new MongoClient(uri)")
// //
// // async function run() {
// //   try {
// //     await client.connect();
// //
// //     const database = client.db('db');
// //     console.log(database)
// //     // const movies = database.collection('movies');
// //
// //     // Query for a movie that has the title 'Back to the Future'
// //     // const query = { title: 'Back to the Future' };
// //     // const movie = await movies.findOne(query);
// //
// //     // console.log(movie);
// //   } finally {
// //     // Ensures that the client will close when you finish/error
// //     await client.close();
// //   }
// // }
// // run().catch(console.dir);
//
// /*---------------------------------------------------------------------------------------------
//  *  Copyright (c) Red Hat, Inc. All rights reserved.
//  *  Licensed under the MIT License. See LICENSE in the project root for license information.
//  *--------------------------------------------------------------------------------------------*/
//
// const mongoose = require('mongoose')
// require('dotenv')
// const {DB_PASS} = process.env;
// const host = "khooshe-bot-db.sahshobeyri.svc"
// const port = "27017"
// const mongoURI = `mongodb://root:${DB_PASS}@${host}:${port}/guestbook`
//
// const db = mongoose.connection;
//
// db.on('disconnected', () => {
//   console.error(`Disconnected: unable to reconnect to ${mongoURI}`)
//   throw new Error(`Disconnected: unable to reconnect to ${mongoURI}`)
// })
// db.on('error', (err) => {
//   console.error(`Unable to connect to ${mongoURI}: ${err}`);
// });
//
// db.once('open', () => {
//   console.log(`connected to ${mongoURI}`);
// });
//
// const connectToMongoDB = async () => {
//   await mongoose.connect(mongoURI, {
//     useNewUrlParser: true,
//     connectTimeoutMS: 2000,
//     reconnectTries: 1
//   })
// };
//
// const messageSchema = mongoose.Schema({
//   name: { type: String, required: [true, 'Name is required'] },
//   body: { type: String, required: [true, 'Message Body is required'] },
//   timestamps: {}
// });
//
// const messageModel = mongoose.model('Message', messageSchema);
//
// const construct = (params) => {
//   const name = params.name
//   const body = params.body
//   const message = new messageModel({ name: name, body: body })
//   return message
// };
//
// const save = (message) => {
//   console.log("saving message...")
//   message.save((err) => {
//     if (err) { throw err }
//   })
// };
//
// // Constructs and saves message
// const create = (params) => {
//   try {
//     const msg = construct(params)
//     const validationError = msg.validateSync()
//     if (validationError) { throw validationError }
//     save(msg)
//   } catch (error) {
//     throw error
//   }
// }
//
// module.exports = {
//   create: create,
//   messageModel: messageModel,
//   connectToMongoDB: connectToMongoDB
// }

