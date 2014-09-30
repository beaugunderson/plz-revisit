'use strict';

var Twit = require('twit');
var _ = require('lodash');

var utilities = require('./lib/utilities.js');
var TwitterUpdateWithMedia = require('./lib/twitter-update-with-media.js');

var SCREEN_NAME = process.env.SCREEN_NAME;

var CONSUMER_KEY = process.env.CONSUMER_KEY;
var CONSUMER_SECRET = process.env.CONSUMER_SECRET;

var ACCESS_TOKEN = process.env.ACCESS_TOKEN;
var ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

var T = new Twit({
  consumer_key: CONSUMER_KEY,
  consumer_secret: CONSUMER_SECRET,
  access_token: ACCESS_TOKEN,
  access_token_secret: ACCESS_TOKEN_SECRET
});

var TUWM = new TwitterUpdateWithMedia({
  consumer_key: CONSUMER_KEY,
  consumer_secret: CONSUMER_SECRET,
  token: ACCESS_TOKEN,
  token_secret: ACCESS_TOKEN_SECRET
});

var stream = T.stream('user');

utilities.populateServices(function (services) {
  stream.on('tweet', function (tweet) {
    // Discard tweets where we're not mentioned
    if (!_.some(tweet.entities.user_mentions, {screen_name: SCREEN_NAME})) {
      return;
    }

    // Discard mentions where there's no media
    if (!tweet.entities || !tweet.entities.media) {
      return;
    }

    tweet.entities.media.forEach(function (media) {
      utilities.revisitUrl(services, media.media_url, function (err, result) {
        if (err || !result) {
          return console.log('Error:', err);
        }

        TUWM.post('@' + tweet.user.screen_name, tweet.id_str, result,
            function (err, response, body) {
          if (err || response.statusCode !== 200) {
            return console.log('TUWM error', err, body);
          }

          console.log('TUWM status', err, response.statusCode);
        });
      });
    });
  });
});
