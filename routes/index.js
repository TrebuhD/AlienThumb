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
        result.forEach(async function(item) {
            let isPresentAlready = await db.existsInCollection(config.mongodb.collectionName, item);
            if (!isPresentAlready) {
                console.log(`adding item id:${item.id}. Is present?${isPresentAlready}`);
                // todo: Add to posting queue
                db.addToCollection(config.mongodb.collectionName, new submission (
                    item.id, item.title, item.domain, item.url,
                    item.selftext, item.is_nsfw, item.name, item.score
                ));
            }
        });
      res.render('index', { title: 'AlienThumb' , subredditName: config.reddit.subName, submissions: result});
    }
  );
});

module.exports = router;
