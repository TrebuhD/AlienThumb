var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  require('../reddit/submissionPollster').getHotPosts(req.app.locals.config).then(
    function(result) {
      res.render('index', { title: 'AlienThumb' , subredditName: 'polska', submissions: result})
    }
  );
});

module.exports = router;
