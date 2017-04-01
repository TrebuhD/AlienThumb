const express = require('express');
const router = express.Router();
const DatabaseUtils = require('../databaseUtils');
const config = require('../config');

let submission = require('../submission');
let db = new DatabaseUtils(config);

/* GET home page. */
router.get('/', function(req, res, next) {
  require('../submissionPollster').getHotPosts(config).then(
    function (result) {
        result.forEach(function(item) {
            let strippedItem = new submission (
                item.id, item.title, item.domain, item.url,
                item.selftext, item.is_nsfw, item.name, item.score
            );
            db.addItemIfNotFound(config, strippedItem, function() { db.addToCollection(config, strippedItem) });
            // todo: Add to posting queue
        });
      res.render('index', { title: 'AlienThumb' , subredditName: config.reddit.subName, submissions: result});
    }
  );
});

module.exports = router;
