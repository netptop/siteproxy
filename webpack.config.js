const path = require('path')
module.exports = {
  entry: './cf_index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'worker.js',
  }
}
