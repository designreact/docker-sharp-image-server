/* eslint-disable */

var webpack = require('webpack')
var nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  devtool: 'source-map',

  entry: __dirname + "/server/index.js",

  output: {
    path: __dirname + '/build/',
    filename: 'server.bundle.js',
  },

  resolve: {
    extensions: ['', '.js', '.json'],
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /tests/],
        loader: 'babel',
        query: {
          presets: ['es2015'],
        },
      },
      {
        test: /\.json$/,
        exclude: [/node_modules/],
        loader: 'json',
      },
    ],
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ],
}
