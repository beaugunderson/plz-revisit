'use strict';

var Canvas = require('canvas-utilities').Canvas;
var utilities = require('canvas-utilities/lib/utilities');
var _ = require('lodash');

var FONT_SIZE = 32;
var PADDING = FONT_SIZE;
var LINE_HEIGHT = Math.round(FONT_SIZE * 1.6);

module.exports = function (width, height, text, cb) {
  var canvas = new Canvas(width, height);

  var context = utilities.getContext(canvas);

  utilities.prettyContext(context);

  var colors = _.shuffle(['black', 'white']);

  context.beginPath();
  context.rect(0, 0, width, height);
  context.fillStyle = colors.pop();
  context.fill();

  var words = text.split(' ');
  var i;
  var line;
  var lines = [];

  context.font = FONT_SIZE + 'pt Helvetica';
  context.fillStyle = colors.pop();

  context.textAlign = 'left';
  context.textBaseline = 'top';

  while (words.length) {
    for (i = 1; i <= words.length; i++) {
      line = words.slice(0, i).join(' ');

      if (context.measureText(line).width + (PADDING * 2) > width) {
        lines.push(words.slice(0, i - 1).join(' '));

        words = words.slice(i - 1);

        break;
      } else if (i === words.length) {
        lines.push(words.slice(0, i).join(' '));

        words = words.slice(i);

        break;
      }
    }
  }

  var textHeight = lines.length * LINE_HEIGHT;

  var randomOffset = _.random(PADDING, height - textHeight - PADDING);

  lines.forEach(function (line, i) {
    var x = PADDING;
    var y = randomOffset + (LINE_HEIGHT * i);

    context.fillText(line, x, y);
  });

  canvas.toBuffer(cb);
};
