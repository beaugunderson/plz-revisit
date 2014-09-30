'use strict';

var request = require('request');

var TwitterUpdateWithMedia = module.exports = function (authSettings) {
  this.API_URL = 'https://api.twitter.com/1.1/statuses/update_with_media.json';

  this.authSettings = authSettings;
};

TwitterUpdateWithMedia.prototype.post =
  function(status, inReplyTo, imageBufferOrStream, callback) {
  var r = request.post(this.API_URL, {
    oauth: this.authSettings
  }, callback);

  var form = r.form();

  form.append('status', status);

  if (inReplyTo) {
    form.append('in_reply_to_status_id', inReplyTo);
  }

  return form.append('media[]', imageBufferOrStream);
};
