// An object for interacting with the submission collection.
// Submissions are kept in 2 stores:
// 1. A 'Cold Store' for past submissions,
// 2. A queue that feeds the poster object with new things to post.

const assert = require('assert');
const config = require('./config');
const mongoUtil = require('./mongoUtil');

let SubmissionStore = function() {
    db = mongoUtil.getDb();
};

SubmissionStore.prototype = {
    addToColdStore: function (objToAdd) {
        assert.notEqual(null, objToAdd);
        db.collection(config.mongodb.coldStoreName)
            .updateOne(objToAdd, objToAdd, {upsert: true}, function (err) {
                if (err) { return console.dir(err) }
            });
    },
    ifSubmissionNew: function(item, callback) {
        assert.notEqual(null, item);
        db.collection(config.mongodb.coldStoreName)
            .find({_id: item._id}).limit(1).count()
            .then(function (count) {
                if (count === 0) {
                    callback();
                }
            }).catch(function(err) {
                if (err) { return console.dir(err); }
                console.log("Promise Rejected: " + err);
            });
    },
    queuePush: function (item) {
        mongoUtil.getQueue().add(item, function (err, id) {
            if (err) { return console.dir(err); }
            console.log(`Adding obj id ${id} to submission-queue.`);
        });
    },
    queuePop: async function () {
        mongoUtil.getQueue().get(function (err, msg) {
            if (err) { console.dir(err); }
            if (!msg) return null;
            console.log (`msg.id: ${msg.id}`);
            console.log (`msg.ack: ${msg.ack}`);
            console.log (`msg.payload: ${msg.payload}`);
            console.log (`msg.tries: ${msg.tries}`);
            return msg;
        });
    },
};

module.exports = SubmissionStore;
