let snoowrap = require('snoowrap');

module.exports = {
    getHotPosts: function(CONFIG) {
        let r = new snoowrap({
            userAgent: 'AlienThumb:v0.0.2 (by /u/trebuszek)',
            clientId: CONFIG.reddit.id,
            clientSecret: CONFIG.reddit.secret,
            username: 'AlienThumb',
            password: CONFIG.reddit.password
        });

        return r.getSubreddit(CONFIG.reddit.subName).getHot().filter(function(obj) {
            return (obj.score > CONFIG.reddit.scoreThreshold);
        });
    }
};
