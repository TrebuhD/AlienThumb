// An object for interacting with the submission collection.
// Submissions are kept in 2 stores:
// 1. A 'Cold Store' for past submissions,
// 2. A queue that feeds the poster object with new things to post.

const assert = require('assert');
const config = require('./config');

let SubmissionStore = function(mongoUtil) {
    this._mongoUtil = mongoUtil;
};

SubmissionStore.prototype = {
    addToColdStore: function (objToAdd) {
        assert.notEqual(null, objToAdd);
        this._mongoUtil.getDb().collection(config.mongodb.coldStoreName)
            .updateOne(objToAdd, objToAdd, {upsert: true}, function (err) {
                if (err) { return console.dir(err) }
            });
    },
    ifSubmissionNew: function(item, callback) {
        assert.notEqual(null, item);
        this._mongoUtil.getDb().collection(config.mongodb.coldStoreName)
            .find({_id: item._id}).limit(1).count()
            .then(function (count) {
                if (count === 0) {
                    callback();
                }
            }).catch(function(err) {
                if (err) { return console.dir(err); }
                console.log("Promise Rejected: " + err);
            });
    }
};

module.exports = SubmissionStore;
