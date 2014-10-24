'use strict';

var botUtilities = require('bot-utilities');
var Twit = require('twit');
var utilities = require('./lib/utilities.js');
var _ = require('lodash');

_.mixin(Twit.prototype, botUtilities.twitMixins);

var SCREEN_NAME = process.env.SCREEN_NAME;
var RE_LEADING_SCREEN_NAME = new RegExp('\\s*.?\\s*' + SCREEN_NAME, 'i');

var T = new Twit(botUtilities.getTwitterAuthFromEnv());

var stream = T.stream('user');

utilities.populateServices(function (services) {
  function processText(tweet) {
    var text = tweet.text.replace(RE_LEADING_SCREEN_NAME, '').trim();

    utilities.revisitText(services, text, function (err, revisitedBuffer) {
      if (err || !revisitedBuffer) {
        return console.log('revisitText error:', err);
      }

      var tweetText = botUtilities.heyYou(tweet.user.screen_name);

      T.updateWithMedia(tweetText, tweet.id_str, revisitedBuffer,
          function (err, response, body) {
        if (err || response.statusCode !== 200) {
          return console.log('TUWM error', err, body);
        }

        console.log('TUWM status', err, response.statusCode);
      });
    });
  }

  function processMedia(tweet, media) {
    utilities.revisitUrl(services, media.media_url, function (err, result) {
      if (err || !result) {
        return console.log('Error:', err);
      }

      var tweetText = botUtilities.heyYou(tweet.user.screen_name);

      T.updateWithMedia(tweetText, tweet.id_str, result,
          function (err, response, body) {
        if (err || response.statusCode !== 200) {
          return console.log('TUWM error', err, body, response);
        }

        console.log('TUWM status', err, response.statusCode);
      });
    });
  }

  stream.on('tweet', function (tweet) {
    // Discard tweets where we're not mentioned
    if (!_.some(tweet.entities.user_mentions, {screen_name: SCREEN_NAME})) {
      return;
    }

    // Don't respond to retweets of our tweets
    if (tweet.retweeted_status &&
        tweet.retweeted_status.user.screen_name === SCREEN_NAME) {
      console.log('ignoring a retweet', tweet.id_str);

      return;
    }

    // Respond to mentions without media by glitching the text
    if (!tweet.entities || !tweet.entities.media) {
      processText(tweet);

      return;
    }

    tweet.entities.media.forEach(function (media) {
      processMedia(tweet, media);
    });
  });
});
