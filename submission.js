function submission(item) {
    this._id = item.id;
    this.title = item.title;
    this.domain = item.domain;
    this.url = item.url;
    this.selftext = item.selftext;
    this.is_nsfw = item.is_nsfw;
    this.name = item.name;
    this.score = item.score;
}

module.exports = submission;
