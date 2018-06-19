const stream = require('stream')

function bufferToStream(buf) {
  // console.log(buf)
  var bufferStream = new stream.PassThrough()
  bufferStream.end(buf)
  return bufferStream
}

module.exports = bufferToStream