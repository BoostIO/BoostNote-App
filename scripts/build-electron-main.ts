import webpack from 'webpack'
import path from 'path'

const compiler = webpack({
  entry: './src/electron/index.ts',
  output: {
    filename: 'index.js',
    path: path.join(__dirname, '../electron'),
  },
  mode: 'production',
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{ loader: 'ts-loader' }],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [new webpack.EnvironmentPlugin(['NODE_ENV', 'BOOST_HUB_BASE_URL'])],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: {
    'electron-log': 'commonjs2 electron-log',
    'electron-updater': 'commonjs2 electron-updater',
  },
})

compiler.run((error, stats) => {
  if (error != null) {
    console.error(error)
  }
  if (stats != null) {
    console.log(
      stats.toString({
        colors: true,
      })
    )
  }
  process.exit(error == null ? 0 : 1)
})
