function submission(id, title, domain, url, selftext, is_nsfw, name, score) {
    this._id = id;
    this.title = title;
    this.domain = domain;
    this.url = url;
    this.selftext = selftext;
    this.is_nsfw = is_nsfw;
    this.name = name;
    this.score = score;
}

module.exports = submission;
