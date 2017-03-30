var express = require('express');
var router = express.Router();
const snoowrap = require('snoowrap')

/* GET home page. */
router.get('/', function(req, res, next) {
  getHotPosts(req.app.locals.config).then(
    function(result) {
      res.render('index', { title: 'AlienThumb' , subredditName: 'polska', submissions: result})
    }
  );
});

function getHotPosts(CONFIG) {
  const r = new snoowrap({
    userAgent: 'AlienThumb:v0.0.1 (by /u/trebuszek)',
    clientId: CONFIG.reddit.id,
    clientSecret: CONFIG.reddit.secret,
    username: 'AlienThumb',
    password: CONFIG.reddit.password
  });

  return r.getSubreddit(CONFIG.reddit.subName).getHot().filter(function(obj) {
    return (obj.score > CONFIG.reddit.scoreThreshold);
  });
}

module.exports = router;
