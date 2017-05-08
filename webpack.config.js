var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'chrome');
var APP_DIR = path.resolve(__dirname, 'app');

var config = {
  node: {
    fs: 'empty'
  },
  entry: {
    "index" : APP_DIR + '/index.jsx'
  },
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  module : {
    loaders : [
      {
        test : /\.jsx?/,
        include : APP_DIR,
        loader : 'babel-loader'
      },
      { 
        test: /\.css$/, 
        loader: "style-loader!css-loader" 
      },
      {
        test: /\.less$/, 
        loader: 'style-loader!css-loader!less-loader'
      },
      { 
        test: /\.png$/, 
        loader: "url-loader" 
      },
      { 
        test: /\.jpg$/, 
        loader: "file-loader" 
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'file-loader'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
      }
    ]
  }
};

module.exports = config;
