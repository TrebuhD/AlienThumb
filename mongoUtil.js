const MongoClient = require("mongodb").MongoClient;
const config = require("./config");
const mongoDbQueue = require("mongodb-queue");

let _db;
let _submissionQueue;

module.exports = {
  connectToServer: async function(callback) {
    await MongoClient.connect(process.env.MONGO_URL, async function(err, db) {
      _db = db;
      _submissionQueue = await mongoDbQueue(db, config.mongodb.postQueueName);
      _submissionQueue.createIndexes(function(err) {
        if (err) {
          console.dir(err);
        }
      });
      return callback(err);
    });
  },
  closeConnection: function() {
    if (_db) {
      _db.close();
    }
  },
  getDb: function() {
    return _db;
  },
  getQueue: function() {
    return _submissionQueue;
  }
};
