const MongoClient = require("mongodb").MongoClient;
const config = require("./config");
const mongoDbQueue = require("mongodb-queue");

let database;
let submissionQueue;

module.exports = {
  connectToServer: async function(callback) {
    await MongoClient.connect(process.env.MONGO_URL, {}, async function(
      err,
      db
    ) {
      database = db;
      submissionQueue = await mongoDbQueue(db, config.mongodb.postQueueName);
      submissionQueue.createIndexes(function(err) {
        if (err) {
          console.dir(err);
        }
      });
      return callback(err);
    });
  },
  closeConnection: function() {
    if (database) {
      database.close();
    }
  },
  getDb: function() {
    return database;
  },
  getQueue: function() {
    return submissionQueue;
  }
};
