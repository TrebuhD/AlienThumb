const MongoClient = require('mongodb').MongoClient;
assert = require('assert');

let DatabaseUtils = function(CONFIG) {
    this.config = CONFIG;
};

DatabaseUtils.prototype = {
    addToCollection: function (collectionName, objToAdd) {
        MongoClient.connect(this.config.mongodb.url, function(err, db) {
            assert.equal(null, err);
            assert.notEqual(objToAdd, null);
            db.collection(collectionName).updateOne(objToAdd, objToAdd, {upsert: true});
            db.close();
            if (err) { return console.dir(err); }
      })
    },
    existsInCollection: function(collectionName, objToFind) {
        MongoClient.connect(this.config.mongodb.url, function(err, db) {
            assert.equal(null, err);
            assert.notEqual(objToFind, null);
            let isFound = db.collection(collectionName).find({_id: objToFind.id}).limit(1).count();
            isFound.then(function (count) {
                console.log(count > 0);
                db.close();
                return (count > 0);
            }).catch(function(err) {
                console.log("Promise Rejected");
                db.close();
            });
            if (err) { return console.dir(err); }
      });
    }
};

module.exports = DatabaseUtils;
