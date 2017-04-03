let config = {};

config.fb = {};
config.mongodb = {};

config.fb.scope = "manage_pages, publish_pages, pages_show_list";

config.mongodb.coldStoreName = "cold-store-" + process.env.REDDIT_SUB_NAME;
config.mongodb.postQueueName = "post-queue-" + process.env.REDDIT_SUB_NAME;

module.exports = config;