'use strict';

var fs = require('fs');
var path = require('path');

var utilities = require('../lib/utilities.js');
var textCanvas = require('../lib/text-canvas.js');

function getServices(type, cb) {
  utilities.populateServices(function (services) {
    utilities.randomServicesForType(services, type, function (randomServices) {
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

    getServices('jpeg', function (services) {
      var data = fs.readFileSync(path.join(__dirname, 'avatar.jpg'));

      utilities.revisitData(services, data, 'image/jpeg', function (err, result) {
        fs.writeFileSync('./output.jpg', result);

        cb(err);
      });
    });
  });
});

var TEXT = 'this is just a simple tweet showing how many characters that a ' +
  'tweet can have also tweet tweet meow tweet meow i like tweetsssss';

describe('revisitText', function () {
  it('should revisit text', function (cb) {
    this.timeout(25000);

    utilities.populateServices(function (services) {
      utilities.revisitText(services, TEXT, function (err, revisitedBuffer) {
        if (err) {
          throw err;
        }

        fs.writeFileSync('revisited-text.png', revisitedBuffer);

        cb();
      });
    });
  });
});

describe('text-canvas', function () {
  it('should be capable of creating a text canvas', function (cb) {
    textCanvas(800, 600, TEXT, function (err, buffer) {
      if (err) {
        throw err;
      }

      fs.writeFileSync('text-canvas.png', buffer);

      cb();
    });
  });
});
