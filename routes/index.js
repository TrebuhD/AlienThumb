const express = require('express');
const router = express.Router();
const DatabaseUtils = require('../databaseUtils');
const config = require('../config');

let db = new DatabaseUtils(config);

/* GET home page. */
router.get('/', function(req, res, next) {
  require('../submissionPollster').getHotPosts(config).then(
    function (result) {
      db.addToCollection(config.mongodb.collectionName, result);
      res.render('index', { title: 'AlienThumb' , subredditName: config.reddit.subName, submissions: result});
    }
  );
});

module.exports = router;
