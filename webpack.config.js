const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const util = require('./tools/util')

const port = 8080

const config = {
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:' + port + '/',
    'webpack/hot/only-dev-server',
    path.join(__dirname, 'src/main/index.js')
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      'components': path.join(__dirname, 'src/components'),
      'lib': path.join(__dirname, 'src/lib'),
      'main': path.join(__dirname, 'src/main')
    }
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({ filename: '[name].css', disable: false, allChunks: true }),
    new HtmlWebpackPlugin(),
    // new webpack.DefinePlugin({
    //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    //   'process.env.CODEMIRROR_THEMES': JSON.stringify(util.getCodeMirrorThemes())
    // }),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      },
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
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          loader: 'css-loader'
        })
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'compiled'),
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    publicPath: 'http://localhost:' + port + '/'
  },
  performance: { hints: false },
  node: {},
  devtool: 'source-map',
  devServer: {
    hot: true,
    port
  }
}

module.exports = config
