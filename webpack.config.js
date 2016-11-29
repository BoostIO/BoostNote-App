'use strict'

const path = require('path')
const webpack = require('webpack')
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin')

const port = process.env.NODE_ENV !== 'test'
  ? 8080
  : 8081

const entry = process.env.NODE_ENV !== 'test'
  ? {
    main: [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:' + port,
      'webpack/hot/only-dev-server',
      './src/main/index.js'
    ]
  }
  : {
    test: [
      'webpack-dev-server/client?http://localhost:' + port,
      'webpack/hot/only-dev-server',
      './tools/webpack-test-entry.js'
    ]
  }

const config = {
  entry,
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'components': path.join(__dirname, 'src/components'),
      'lib': path.join(__dirname, 'src/lib'),
      'main': path.join(__dirname, 'src/main')
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new NodeTargetPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
    })
  ],
  externals: [
    'electron',
    'styled-components',
    'pouchdb',
    'sander',
    'electron-devtools-installer',
    'octicons',
    'filenamify',
    'color',
    'moment',
    'remark',
    'remark-lint',
    'remark-html',
    'remark-emoji',
    'lodash',
    {
      react: 'var React',
      'react-dom': 'var ReactDOM',
      'react-redux': 'var ReactRedux',
      'redux': 'var Redux',
      'immutable': 'var Immutable',
      'codemirror': 'var CodeMirror'
    }
  ],
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ],
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /\.json?$/,
        use: [
          {
            loader: 'json-loader'
          }
        ]
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'compiled'),
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    libraryTarget: 'commonjs2',
    publicPath: 'http://localhost:' + port + '/assets/'
  },
  devtool: 'eval',
  devServer: {
    hot: true,
    port
  }
}

module.exports = config

