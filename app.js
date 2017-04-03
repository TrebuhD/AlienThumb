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

    // make config available in routes
    app.locals.config = require('./config');

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
                "client_id": config.fb.app_id,
                "redirect_uri": config.fb.redirect_uri,
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
                "client_id": config.fb.app_id,
                "redirect_uri": config.fb.redirect_uri,
                "client_secret": config.fb.app_secret,
                "code": req.query.code
            }, function (err, facebookRes) {
                console.log('redirecting');
                if (err) { console.dir(err); }
                graph.setAccessToken(config.fb.long_lived_token_page);
                res.redirect('/UserHasLoggedIn');
            });
        }
    });

    // Get new submissions from reddit and save them to mongo
    app.get('/UserHasLoggedIn', updateFromReddit );

    // Render route to browser and then start getting items from queue
    app.get('/UserHasLoggedIn', startQueueStream);

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

let startQueueStream = function () {
    // run every hour
    let everyHour = 60 * 60 * 1000;
    let everyMinute = 60 * 1000;
    // setInterval(shareQueueItem, everyMinute);
    postToFb();
};

let shareQueueItem = async function () {
    let item = await submissionStore.queuePop();
    if (item) {
        await submissionStore.queueAck(item.ack);
        console.log(`Sharing submission title: ${item.payload.title}: `);
        console.dir(item.payload);
        submissionStore.queueClean();
    }
};

let postToFb = function () {
    let examplePost = {
        message: "It finally worked. You can rest for a while now.",
        client_id: config.fb.app_id
     };

    console.dir(graph.get('/me/accounts'));

    graph.post(`/${config.fb.pageId}/feed`, examplePost, function (err, res) {
        if (err) { console.dir(err); }
    });
};

let updateFromReddit = function (req, res, next) {
    console.log("Getting new posts");
    submissionPollster.getHotPosts(config).then(
        function (result) {
            // save the result to use in routes
            app.set('hotPosts', result);
            result.forEach(function(item) {
                let submission = new Submission (item);
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

require('./cleanup').Cleanup(cleanupOnClose);

function cleanupOnClose() {
    console.log("Closing db connection");
    mongoUtil.closeConnection();
}

module.exports = app;
