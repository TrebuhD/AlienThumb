# AlienThumb
### Publishes trending reddit submissions to a facebook page

internet rule #24: Every repost is always a repost of a repost.

## Running

1. Clone the repo
2. `npm install`
2. Duplicate `env.example` file, rename to `.env` and set your custom values.
3. `node bin/www`
4. Go to localhost:3000 to authenticate with Facebook.

## Environment variables

- REDDIT_ID: your reddit app ID
- REDDIT_SECRET: reddit app secret
- REDDIT_USERNAME
- REDDIT_PASSWORD 
- REDDIT_SUB_NAME: the name of the subreddit to repost from
- REDDIT_MIN_SCORE: minimum score to repost submission

- FB_USER_ID: facebook page admin ID (https://findmyfbid.com/)
- FB_PAGE_ID: facebook page ID (found in about section)
- FB_APP_ID
- FB_APP_SECRET
- FB_REDIRECT_URI: The authentication URI (set in facebook app settings)
- FB_PAGE_LONG_TOKEN: non-expiring fb *page* access token

- MONGO_URL: url to mongo database
- MINUTES_BETWEEN_POSTS: The frequency with which to post
- MUSICONLY: will only repost music (from a set of domains) if set to true

## How to generate a non-expiring facebook page access token:

http://stackoverflow.com/questions/17197970/facebook-permanent-page-access-token
