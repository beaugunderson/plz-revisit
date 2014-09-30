'use strict';

var async = require('async');
var request = require('request');
var _ = require('lodash');

var SERVICES_URL = 'http://hub.revisit.link/services';

exports.populateServices = function (cb) {
  request.get({url: SERVICES_URL, json: true}, function (err, response, body) {
    if (err || response.statusCode !== 200) {
      throw new Error('Couldn\'t get services list.');
    }

    cb(body.services);
  });
};

var randomServicesForType = exports.randomServicesForType =
  function (services, imageType, cb) {
  var chosenServices = _(services)
    .filter(function (service) {
      return _.contains(service.supports, imageType);
    })
   .sample(_.random(3, 5))
   .value();

  async.filter(chosenServices, function (service, cbFilter) {
    request.head(service.online, function (err, response) {
      cbFilter(!err && response.statusCode === 200);
    });
  },
  function (services) {
    cb(_.pluck(services, 'url'));
  });
};

var revisitData = exports.revisitData = function (services, buffer, type, cb) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('revisitData requires a buffer');
  }

  var content = 'data:image/' + type + ';base64,' + buffer.toString('base64');

  async.eachSeries(services, function (service, cbEach) {
    console.log('posting to', service);

    request.post({
      url: service + '/service',
      json: {
        content: {
          data: content
        },
        meta: {}
      }
    }, function (err, response, body) {
      if (body) {
        console.log(JSON.stringify(body.meta, null, 2));
      }

      // Skip failing transforms
      if (err || !body || !body.content) {
        console.log('Skipped', service);

        return cbEach();
      }

      content = body.content.data;

      cbEach();
    });
  }, function (err) {
    var resultBuffer = new Buffer(content.split(',')[1], 'base64');

    cb(err, resultBuffer);
  });
};

exports.revisitUrl = function (services, url, cb) {
  request.get({url: url, encoding: null}, function (err, response, body) {
    if (err || response.statusCode !== 200) {
      console.error('Error getting media:', url, err);

      return cb(err);
    }

    var imageType = response.headers['content-type']
      .match(/image\/(.*)/)[1];

    console.log('got image URL', url);
    console.log('got image type', imageType);

    randomServicesForType(services, imageType, function (services) {
      revisitData(services, body, imageType, function (err, result) {
        cb(err, result);
      });
    });
  });
};