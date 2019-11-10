const express = require('express');
const router = express.Router({});

router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'AlienThumb' ,
        subredditName: process.env.REDDIT_SUB_NAME,
        submissions: req.app.get('hotPosts')
    });
    next();
});

module.exports = router;
