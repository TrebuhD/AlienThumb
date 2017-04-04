require('dotenv').config();
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoUtil = require('./mongoUtil');
const SubmissionStore = require('./submissionStore');
const Submission = require('./submission');
const config = require('./config');

const index = require('./routes/index');

let graph = require('fbgraph');
let submissionPollster = require('./submissionPollster');
let submissionStore;

let app = express();

mongoUtil.connectToServer(function(err) {
    if (err) { console.error(err); }
    console.log("connected to mongodb");

    submissionStore = new SubmissionStore();

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(cookieParser());
    app.use(require('node-sass-middleware')({
        src: path.join(__dirname, 'public'),
        dest: path.join(__dirname, 'public'),
        indentedSyntax: true,
        sourceMap: true
    }));
    app.use(express.static(path.join(__dirname, 'public')));

    app.on('listening', index, function() {
        console.log("Listening on port 3000, boss!")
    });

    // Routes

    app.get('/', function(req, res){
        res.render("index", { title: "navigate to /auth to connect" });
    });

    app.get('/auth', function (req, res) {
        // we have no code yet
        if (!req.query.code) {
            console.log("Performing oauth");

            let authUrl = graph.getOauthUrl({
                "client_id": process.env.FB_APP_ID,
                "redirect_uri": process.env.FB_REDIRECT_URI,
                "scope": config.fb.scope
            });

            if (!req.query.error) {
                res.redirect(authUrl);
            } else {
                res.send('access denied: ' + res.query.error);
            }
        }
        // user is being redirected with code
        else {
            // send code and get access token
            graph.authorize({
                "client_id": process.env.FB_APP_ID,
                "redirect_uri": process.env.FB_REDIRECT_URI,
                "client_secret": process.env.FB_APP_SECRET,
                "code": req.query.code
            }, function (err, facebookRes) {
                if (err) { console.dir(err); }
                console.log('redirecting');
                graph.setAccessToken(process.env.FB_PAGE_LONG_TOKEN);
                res.redirect('/UserHasLoggedIn');
            });
        }
    });

    // Get new submissions from reddit and save them to mongo
    app.get('/UserHasLoggedIn', updateFromReddit );

    // Render route to browser and then start getting items from queue
    app.get('/UserHasLoggedIn', startMainLoop);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

});

let startMainLoop = function () {
    let time = process.env.MINUTES_BETWEEN_POSTS * 60 * 1000;
    // randomize the timing a bit by multiplying by a value between 0.5 and 1.5
    let rTime = (Math.random() + 0.5) * time;
    setInterval(shareQueueItem, rTime);
    setInterval(getNewPosts, rTime);
};

let getNewPosts = function () {
    return updateFromReddit(next=function () {});
};

let shareQueueItem = async function () {
    let item = await submissionStore.queuePop();
    if (item) {
        await submissionStore.queueAck(item.ack);
        console.log(`Sharing submission title: ${item.payload.title}: `);
        console.dir(item.payload);
        postToFb(item.payload);
        submissionStore.queueClean();
    }
};

let postToFb = function (item) {
    console.log(`Posting to fb: ${item.title}`);
    let fbPost = {
        message: item.title,
        link: item.url
     };

    graph.post(`/${process.env.FB_PAGE_ID}/feed`, fbPost, function (err, res) {
        if (err) { console.dir(err); }
    });
};

let updateFromReddit = function (req, res, next) {
    console.log("Getting new posts");
    submissionPollster.getHotPosts().then(
        function (result) {
            // save the result to use in routes
            app.set('hotPosts', result);
            result.forEach(function(item) {
                let submission = new Submission (item);
                if (isSubmissionOK(submission))
                    // store new submissions in cold storage and post queue.
                    submissionStore.ifSubmissionNew(submission, function() {
                        submissionStore.addToColdStore(submission);
                        submissionStore.queuePush(submission);
                    });
            });
            next();
        }
    );
};

function isSubmissionOK(submission) {
    // Don't store NSFW or selftext posts
    if (submission.is_nsfw || submission.selftext) { return false; }
    let title = submission.title;
    if (title.includes("comments") || title.includes("/r/")) { return false; }
    return true;
}

require('./cleanup').Cleanup(cleanupOnClose);

function cleanupOnClose() {
    console.log("Closing db connection");
    mongoUtil.closeConnection();
}

module.exports = app;
