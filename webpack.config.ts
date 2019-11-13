import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import express from 'express'
import ErrorOverlayPlugin from 'error-overlay-webpack-plugin'
import dotenv from 'dotenv'
import CopyPlugin from 'copy-webpack-plugin'
import Dotenv from 'dotenv-webpack'

const { parsed } = dotenv.config()

module.exports = {
  entry: [
    'react-hot-loader/patch',
    // activate HMR for React

    'webpack-dev-server/client?http://localhost:3000',
    // bundle the client for webpack-dev-server
    // and connect to the provided endpoint

    'webpack/hot/only-dev-server',
    // bundle the client for hot reloading
    // only- means to only hot reload for successful updates

    './src/index.tsx'
    // the entry point of our app
  ],

  output: {
    filename: 'bundle.js',
    // the output bundle

    path: path.resolve(__dirname, 'dist'),

    publicPath: '/app'
    // necessary for HMR to know where to load the hot update chunks
  },

  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        loader: 'url-loader',
        options: {
          limit: 8192
        }
      },
      {
        test: /\.tsx?$/,
        use: [{ loader: 'ts-loader' }],
        exclude: /node_modules/
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // enable HMR globally

    new webpack.NamedModulesPlugin(),
    // prints more readable module names in the browser console on HMR updates

    new webpack.NoEmitOnErrorsPlugin(),
    // do not emit compiled assets that include errors
    new HtmlWebpackPlugin(),
    new ErrorOverlayPlugin(),
    new Dotenv(),
    new CopyPlugin([
      {
        from: path.join(__dirname, 'node_modules/codemirror/theme'),
        to: 'codemirror/theme'
      }
    ])
  ],

  devServer: {
    host: 'localhost',
    port: 3000,

    historyApiFallback: {
      index: '/app'
    },
    // respond to 404s with index.html

    hot: true,
    // enable HMR on the server

    before: function (app, server) {
      app.use(
        '/codemirror/mode',
        express.static(path.join(__dirname, 'node_modules/codemirror/mode'))
      )
      app.use(
        '/codemirror/addon',
        express.static(path.join(__dirname, 'node_modules/codemirror/addon'))
      )
      app.use(
        '/codemirror/theme',
        express.static(path.join(__dirname, 'node_modules/codemirror/theme'))
      )
    }
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  node: {
    fs: 'empty'
  }
}
