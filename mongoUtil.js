// code by go-oleg from SO:
// http://stackoverflow.com/questions/24621940/how-to-properly-reuse-connection-to-mongodb-across-nodejs-application-and-module

const MongoClient = require('mongodb').MongoClient;
const config = require('./config');
const mongoDbQueue = require('mongodb-queue');

let _db;
let _submissionQueue;

module.exports = {

    connectToServer: async function ( callback ) {
        MongoClient.connect(config.mongodb.url, async function (err, db) {
            _db = db;
            _submissionQueue = await mongoDbQueue(db, config.mongodb.postQueueName);
            _submissionQueue.createIndexes(function (err) {
                if (err) { console.dir(err); }
            });
            return callback(err);
        });
    },
    closeConnection: function () {
        if (_db) {
            _db.close();
        }
    },
    getDb: function () {
        return _db;
    },
    getQueue: function () {
        return _submissionQueue;
    },
    queueClean: function () {
        _submissionQueue.clean(new function (err) {
            if (err) { console.dir(err); }
        });
    },
    queuePop: async function () {
        _submissionQueue.get(function (err, msg) {
            if (err) { console.dir(err); }
            if (!msg) return null;
            console.log (`msg.id: ${msg.id}`);
            console.log (`msg.ack: ${msg.ack}`);
            console.log (`msg.payload: ${msg.payload}`);
            console.log (`msg.tries: ${msg.tries}`);
            return msg;
        });
    },
    queuePush: function (item) {
        _submissionQueue.add(item, function (err, id) {
            if (err) { return console.dir(err); }
            console.log(`Adding obj id ${id} to submission-queue.`);
        });
    }
};
