const MongoClient = require('mongodb').MongoClient;
assert = require('assert');

let DatabaseUtils = function(CONFIG) {
    this.config = CONFIG;
};

DatabaseUtils.prototype = {
    addToCollection: function (collectionName, objToAdd) {
        MongoClient.connect(this.config.mongodb.url, function(err, db) {
            assert.notEqual(objToAdd, null);
            assert.equal(null, err);
            db.collection(collectionName).updateOne(objToAdd, objToAdd, {upsert: true});
            db.close();
            if (err) { return console.dir(err); }
      })
    },
    isInCollection: function(collectionName, what) {
        MongoClient.connect(this.config.mongodb.url, function(err, db) {
            assert.notEqual(objToAdd, null);
            assert.equal(null, err);
            db.close();
            if (err) { return console.dir(err); }
      });
        return true;
    }
};

module.exports = DatabaseUtils;
