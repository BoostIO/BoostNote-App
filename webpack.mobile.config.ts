import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import express from 'express'
import ErrorOverlayPlugin from 'error-overlay-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import packageJson from './package.json'

const devServerPort = 3001

module.exports = (env, argv) => {
  const config = {
    entry: [
      './src/mobile/index.tsx'
      // the entry point of our app
    ],

    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'compiled-mobile')
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
        },
        {
          test: /\.md$/,
          use: [
            {
              loader: 'raw-loader'
            }
          ]
        }
      ]
    },

    plugins: [
      new webpack.NamedModulesPlugin(),
      // prints more readable module names in the browser console on HMR updates

      new webpack.NoEmitOnErrorsPlugin(),
      // do not emit compiled assets that include errors
      new HtmlWebpackPlugin({
        template: 'mobile.html'
      }),
      new ErrorOverlayPlugin(),
      new webpack.DefinePlugin({
        'process.env.VERSION': JSON.stringify(packageJson.version)
      }),
      new webpack.EnvironmentPlugin([
        'NODE_ENV',
        'MOBILE_AMPLIFY_AUTH_IDENTITY_POOL_ID',
        'MOBILE_AMPLIFY_AUTH_REGION',
        'MOBILE_AMPLIFY_PINPOINT_APPID',
        'MOBILE_AMPLIFY_PINPOINT_REGION',
        'BOOST_NOTE_BASE_URL'
      ]),
      new CopyPlugin([
        {
          from: path.join(__dirname, 'node_modules/codemirror/theme'),
          to: 'm/codemirror/theme'
        }
      ]),
      new CopyPlugin([
        {
          from: path.join(__dirname, 'static'),
          to: 'm/static'
        }
      ])
    ],

    devServer: {
      host: 'localhost',
      port: devServerPort,

      historyApiFallback: {
        index: '/m'
      },
      // respond to 404s with index.html

      hot: true,
      // enable HMR on the server

      before: function(app, server) {
        app.use(
          '/m/codemirror/mode',
          express.static(path.join(__dirname, 'node_modules/codemirror/mode'))
        )
        app.use(
          '/m/codemirror/addon',
          express.static(path.join(__dirname, 'node_modules/codemirror/addon'))
        )
        app.use(
          '/m/codemirror/theme',
          express.static(path.join(__dirname, 'node_modules/codemirror/theme'))
        )
        app.use('/m/static', express.static(path.join(__dirname, 'static')))
      }
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    node: {
      fs: 'empty'
    }
  }

  if (argv.mode === 'development') {
    config.plugins.unshift(new webpack.HotModuleReplacementPlugin())

    config.entry.unshift(
      'react-hot-loader/patch',
      `webpack-dev-server/client?http://localhost:${devServerPort}`,
      'webpack/hot/only-dev-server'
    )
    ;(config.output as any).publicPath = `http://localhost:${devServerPort}/m`
  }

  if (argv.mode === 'production') {
    ;(config as any).optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_fnames: /Block|Value|Bool|BooleanLiteral|Null|NullLiteral|Literal|NumberLiteral|StringLiteral|RegexLiteral|Arr|Obj|Op|Parens/
          }
        })
      ]
    }
  }

  if (argv.mode !== 'development') {
    ;(config.output as any).publicPath = 'file:///android_asset/compiled/'
  }

  return config
}
