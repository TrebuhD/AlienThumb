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

let submissionStore = new SubmissionStore(mongoUtil, config);
let submissionPollster = require('./submissionPollster');

function cleanupOnClose() {
    console.log("Closing db connection");
    mongoUtil.closeConnection();
}

let cleanup = require('./cleanup').Cleanup(cleanupOnClose);

let app = express();

mongoUtil.connectToServer(function(err) {
    if (err) { console.error(err); }
    console.log("connected to mongodb");

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

    // Main functionality
    app.use('/', function () {
        console.log("Inside main function");
        submissionPollster.getHotPosts(config).then(
            function (result) {
                result.forEach(function(item) {
                    let strippedItem = new Submission (
                        item.id, item.title, item.domain, item.url,
                        item.selftext, item.is_nsfw, item.name, item.score
                    );
                    submissionStore.addItemIfNotFound(strippedItem, function() {
                        submissionStore.addToCollection(strippedItem);
                        mongoUtil.queuePush(strippedItem);
                    });
                });
                // print new item from queue every 5 seconds
                setInterval(async function () {
                    let item = mongoUtil.queuePop();
                    console.dir(item);
                }, 5000);

            }
        );
    });

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

module.exports = app;
