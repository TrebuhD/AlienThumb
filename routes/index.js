const express = require('express');
const router = express.Router();
const DatabaseUtils = require('../databaseUtils');
const config = require('../config');

let db = new DatabaseUtils(config);

/* GET home page. */
router.get('/', function(req, res, next) {
  require('../submissionPollster').getHotPosts(config).then(
    function (result) {
        result.forEach(function(item, index, array) {
            db.addToCollection(config.mongodb.collectionName, {
                _id: item.id,
                title: item.title,
                domain: item.domain,
                url: item.url,
                selftext: item.selftext,
                is_nsfw: item.over_18,
                name: item.name,
                score: item.score
            });
        })
      res.render('index', { title: 'AlienThumb' , subredditName: config.reddit.subName, submissions: result});
    }
  );
});

module.exports = router;
