let snoowrap = require("snoowrap");

module.exports = {
  getHotPosts: function() {
    let r = new snoowrap({
      userAgent: "AlienThumb:v0.0.3 (by /u/trebuszek)",
      clientId: process.env.REDDIT_ID,
      clientSecret: process.env.REDDIT_SECRET
      // username: process.env.REDDIT_USERNAME,
      // password: process.env.REDDIT_PASSWORD
    });

    // Get hot submissions and filter out those with score lower than threshold
    return r
      .getSubreddit(process.env.REDDIT_SUB_NAME)
      .getHot()
      .filter(function(obj) {
        return obj.score > process.env.REDDIT_MIN_SCORE;
      });
  }
};
