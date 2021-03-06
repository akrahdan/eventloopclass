// Extend Node internal parser to take care of data buffering and have a nicer API.
// See parser_demo.js for sample usage.

var HTTPParser = process.binding('http_parser').HTTPParser,
    events = require('events')

// Make HTTPParser inherit from EventEmitter without changing it's prototype.
HTTPParser.prototype.__proto__ = events.EventEmitter.prototype

// Constants used by the parser for callbacks.
// Taken from Node internals.
var kOnHeaders = HTTPParser.kOnHeaders | 0
var kOnHeadersComplete = HTTPParser.kOnHeadersComplete | 0
var kOnBody = HTTPParser.kOnBody | 0
var kOnMessageComplete = HTTPParser.kOnMessageComplete | 0

// Creates and return an new parser.
exports.createParser = function() {
  var parser = new HTTPParser(HTTPParser.REQUEST),
      info

  events.EventEmitter.call(parser)

  // Store headers
  parser[kOnHeadersComplete] = function(headers) {
    info = headers
    info.method = HTTPParser.methods[info.method]
  }

  parser[kOnMessageComplete] = function() {
    parser.emit('request', info)
  }

  return parser
}

// Feed a string to the parser.
// `onComplete` will be called if this results in a complete HTTP request.
HTTPParser.prototype.parse = function(data) {
  // Buffer data
  var buffer = this.buffer = this.buffer || ""
  var start = buffer.length
  buffer += data
  
  this.execute(new Buffer(buffer), start, data.length)
}
