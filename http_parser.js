// Extend Node internal parser to take care of data buffering.
var HTTPParser = process.binding('http_parser').HTTPParser,
    events = require('events')

// Make HTTPParser inherit from EventEmitter without changing it's prototype.
HTTPParser.prototype.__proto__ = events.EventEmitter.prototype


HTTPParser.prototype.parse = function(data) {
  var buffer = this.buffer = this.buffer || "";
  var start = buffer.length;
  buffer += data;
  
  this.execute(new Buffer(buffer), start, data.length);
};

exports.createParser = function() {
  var parser = new HTTPParser(HTTPParser.REQUEST),
      info

  events.EventEmitter.call(parser)

  // Store headers
  parser.onHeadersComplete = function(headers) {
    info = headers
    info.method = HTTPParser.methods[info.method]
  }

  parser.onMessageComplete = function() {
    parser.emit('request', info)
  }

  return parser
}
