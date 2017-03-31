var express = require('express');
var router = express.Router();
var DatabaseUtils = require('../databaseUtils');
var config = require('../config');

var db = new DatabaseUtils(config);

/* GET home page. */
router.get('/', function(req, res, next) {
  require('../submissionPollster').getHotPosts(config).then(
    function (result) {
      let testObj = {testId: "thisIsIt"};
      db.addToCollection(config.mongodb.collectionName, result);
      res.render('index', { title: 'AlienThumb' , subredditName: config.reddit.subName, submissions: result});
    }
  );
});

module.exports = router;
