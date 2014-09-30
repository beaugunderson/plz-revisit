'use strict';

var fs = require('fs');
var path = require('path');

var utilities = require('../lib/utilities.js');

function getJpgServices(cb) {
  utilities.populateServices(function (services) {
    utilities.randomServicesForType(services, 'jpeg', function (randomServices) {
      cb(randomServices);
    });
  });
}

describe('revisitUrl', function () {
  it('should revisit a URL', function (cb) {
    this.timeout(25000);

    var URL = 'http://pbs.twimg.com/media/By0TFxQCQAAfnLU.jpg';

    utilities.populateServices(function (services) {
      utilities.revisitUrl(services, URL, function (err, result) {
        fs.writeFileSync(path.join(__dirname, './output-url.jpg'), result);

        cb(err);
      });
    });
  });
});

describe('revisitData', function () {
  it('should revisit data', function (cb) {
    this.timeout(25000);

    getJpgServices(function (services) {
      var data = fs.readFileSync(path.join(__dirname, 'avatar.jpg'));

      utilities.revisitData(services, data, 'image/jpeg', function (err, result) {
        fs.writeFileSync('./output.jpg', result);

        cb(err);
      });
    });
  });
});
