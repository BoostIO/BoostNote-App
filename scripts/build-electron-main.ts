import webpack from 'webpack'
import path from 'path'

const compiler = webpack({
  entry: './src/app/index.ts',
  output: {
    filename: 'index.js',
    path: path.join(__dirname, '../app'),
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
