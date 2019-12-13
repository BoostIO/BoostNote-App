import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ErrorOverlayPlugin from 'error-overlay-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'

module.exports = {
  mode: 'production',
  entry: [
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

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_fnames: /Block|Value|Bool|BooleanLiteral|Null|NullLiteral|Literal|NumberLiteral|StringLiteral|RegexLiteral|Arr|Obj|Op|Parens/
        }
      })
    ]
  },

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
    new webpack.NoEmitOnErrorsPlugin(),
    // do not emit compiled assets that include errors
    new HtmlWebpackPlugin(),
    new ErrorOverlayPlugin(),
    new webpack.EnvironmentPlugin([
      'NODE_ENV',
      'AMPLIFY_AUTH_IDENTITY_POOL_ID',
      'AMPLIFY_AUTH_REGION',
      'AMPLIFY_PINPOINT_APPID',
      'AMPLIFY_PINPOINT_REGION',
      'BOOST_NOTE_BASE_URL'
    ]),
    new CopyPlugin([
      {
        from: path.join(__dirname, 'node_modules/codemirror/theme'),
        to: 'codemirror/theme'
      }
    ])
  ],

  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  node: {
    fs: 'empty'
  }
}
