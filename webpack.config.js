const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// const util = require('./tools/util')

const port = 8080

const config = {
  entry: [
    'webpack-dev-server/client?http://localhost:' + port + '/',
    'webpack/hot/only-dev-server',
    path.join(__dirname, 'build/client/index.js')
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      'client': path.join(__dirname, 'build/client'),
      'style': path.join(__dirname, 'build/style'),
      'lib': path.join(__dirname, 'build/lib'),
    }
  },
  plugins: [
    // new webpack.DefinePlugin({
    //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    //   'process.env.CODEMIRROR_THEMES': JSON.stringify(util.getCodeMirrorThemes())
    // }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new ExtractTextPlugin({ filename: '[name].[hash].css' }),
    new HtmlWebpackPlugin(),
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
        test: /\.(ts|tsx)$/,
        use: 'ts-loader'
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
    filename: '[name].[hash].js',
    sourceMapFilename: '[name].[hash].map',
    publicPath: 'http://localhost:' + port + '/'
  },
  performance: { hints: false },
  node: {},
  devtool: 'source-map',
  devServer: {
    hot: true,
    port,
    historyApiFallback: true
  }
}

module.exports = config
