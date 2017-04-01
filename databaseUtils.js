const MongoClient = require('mongodb').MongoClient;
assert = require('assert');

let DatabaseUtils = function() {
};

DatabaseUtils.prototype = {
    addToCollection: function (config, objToAdd) {
        MongoClient.connect(config.mongodb.url, function(err, db) {
            assert.equal(null, err);
            assert.notEqual(objToAdd, null);
            db.collection(config.mongodb.collectionName).updateOne(objToAdd, objToAdd, {upsert: true});
            db.close();
            if (err) { return console.dir(err); }
      })
    },
    addItemIfNotFound: function(config, item, callback) {
        MongoClient.connect(config.mongodb.url, function(err, db) {
            assert.equal(null, err);
            assert.notEqual(item, null);
            db.collection(config.mongodb.collectionName).find({_id: item._id}).limit(1).count()
                .then(function (count) {
                    if (count === 0) {
                        callback();
                    }
                }).catch(function(err) {
                    console.log("Promise Rejected: " + err);
                    db.close();
            });
            if (err) { return console.dir(err); }
      });
    }
};

module.exports = DatabaseUtils;
