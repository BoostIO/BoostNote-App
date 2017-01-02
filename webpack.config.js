'use strict'

const path = require('path')
const webpack = require('webpack')
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin')
const util = require('./tools/util')

const port = 8080

let config = {
  entry: {
    main: ['./src/main/index.js'],
    preferences: ['./src/preferences/index.js']
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'components': path.join(__dirname, 'src/components'),
      'lib': path.join(__dirname, 'src/lib'),
      'main': path.join(__dirname, 'src/main')
    }
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new NodeTargetPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
      'process.env.CODEMIRROR_THEMES': JSON.stringify(util.getCodeMirrorThemes())
    })
  ],
  externals: [
    // Electron
    'electron',
    // CommonJS2
    'styled-components',
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
    'remark-slug',
    'strip-markdown',
    'lodash',
    'katex',
    'react-immutable-proptypes',
    {
      // Global
      react: 'var React',
      'react-dom': 'var ReactDOM',
      'react-redux': 'var ReactRedux',
      'redux': 'var Redux',
      'immutable': 'var Immutable',
      'codemirror': 'var CodeMirror',
      'pouchdb': 'var PouchDB'
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
  performance: { hints: false },
  node: {},
  devtool: 'eval',
  devServer: {
    hot: true,
    port
  }
}

switch (process.env.NODE_ENV) {
  case 'production':
    config.plugins.push(new webpack.optimize.UglifyJsPlugin())
    config.plugins.push(new webpack.LoaderOptionsPlugin({
      minimize: true
    }))

    config.performance.hints = true
    break
  case 'development':
    config.plugins.push(new webpack.HotModuleReplacementPlugin())

    const devEntry = [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:' + port,
      'webpack/hot/only-dev-server'
    ]
    config.entry.main = devEntry.concat(config.entry.main)
    config.entry.preferences = devEntry.concat(config.entry.preferences)
    break
  case 'test':
    config.plugins.push(new webpack.HotModuleReplacementPlugin())

    config.entry = {
      test: [
        'webpack-dev-server/client?http://localhost:' + 8081,
        'webpack/hot/only-dev-server',
        './tools/webpack-test-entry.js'
      ]
    }

    config.output.publicPath = 'http://localhost:' + 8081 + '/assets/'
    config.devServer.port = 8081
    config.node.__filename = true
    config.node.__dirname = true
    config.resolve.alias.specs = path.join(__dirname, 'specs')
}

module.exports = config
