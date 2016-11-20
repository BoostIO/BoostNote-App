'use strict'

const path = require('path')
const webpack = require('webpack')
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin')

const config = {
  entry: {
    main: [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:8080',
      './src/main/index.js'
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'components': path.join(__dirname, 'src/components'),
      'main': path.join(__dirname, 'src/main')
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new NodeTargetPlugin()
  ],
  externals: [
    'electron',
    'styled-components',
    'pouchdb',
    'sander',
    'electron-devtools-installer',
    'octicons',
    'filenamify',
    {
      react: 'var React',
      'react-dom': 'var ReactDOM',
      'react-redux': 'var ReactRedux',
      'redux': 'var Redux',
      'immutable': 'var Immutable'
    }
  ],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        use: [
          {
            loader: 'react-hot-loader/webpack'
          },
          {
            loader: 'babel-loader'
          }
        ],
        include: path.join(__dirname, 'src')
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'compiled'),
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    libraryTarget: 'commonjs2',
    publicPath: 'http://localhost:8080/assets/'
  },
  devtool: 'eval',
  devServer: {
    hot: true
  }
}

module.exports = config

