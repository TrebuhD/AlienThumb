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

    // Get new submissions from reddit and save them to mongo
    app.get('/', updateFromReddit );

    // Render route to browser and then start getting items from queue
    app.get('/', index, startQueueStream);

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

// print new item from queue every 5 seconds
let startQueueStream = function () {
    console.log("popping the post queue");
    setInterval(async function () {
        let item = submissionStore.queuePop();
        console.dir(item);
    }, 5000);
};

let updateFromReddit = function (req, res, next) {
    console.log("Getting new posts");
    submissionPollster.getHotPosts(config).then(
        function (result) {
            // save the result to use in routes
            app.set('hotPosts', result);
            result.forEach(function(item) {
                let strippedItem = new Submission (item);
                // store new submissions in cold storage and post queue.
                submissionStore.ifSubmissionNew(strippedItem, function() {
                    submissionStore.addToColdStore(strippedItem);
                    submissionStore.queuePush(strippedItem);
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
