var express = require('express');
var router = express.Router();
const snoowrap = require('snoowrap')



/* GET home page. */
router.get('/', function(req, res, next) {
  getHotPosts('polska', req.app.locals.config).then(
    function(result) {
      res.render('index', { title: 'AlienThumb' , subredditName: 'polska', submissions: result})
    }
  );
});

function getHotPosts(subName, CONFIG) {
  const r = new snoowrap({
    userAgent: 'AlienThumb:v0.0.1 (by /u/trebuszek)',
    clientId: CONFIG.reddit.id,
    clientSecret: CONFIG.reddit.secret,
    username: 'AlienThumb',
    password: CONFIG.reddit.password
  });

  return r.getSubreddit(subName).getHot();
}

module.exports = router;
