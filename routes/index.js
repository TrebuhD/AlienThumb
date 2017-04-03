const express = require('express');
const router = express.Router();

const config = require('../config');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'AlienThumb' ,
        subredditName: config.reddit.subName,
        submissions: req.app.get('hotPosts')
    });
    next();
});

module.exports = router;
