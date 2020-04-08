import webpack from 'webpack'
import path from 'path'
import os from 'os'
import { execFile, ChildProcess } from 'child_process'
import chalk from 'chalk'

const tmpDirPath = os.tmpdir()
const outputFilename = 'boostnote.main.js'
const outputPath = path.join(tmpDirPath, outputFilename)

const compiler = webpack({
  entry: './app/index.ts',
  output: {
    filename: outputFilename,
    path: tmpDirPath,
  },
  mode: 'development',
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
})

function execute() {
  const process = execFile(
    path.join(__dirname, '../node_modules/.bin/electron'),
    [outputPath]
  )

  process.stdout.on('data', (data) => {
    const title = `Electron stdout(pid:${process.pid})`
    console.log(
      `${chalk.bgBlueBright(`>> ${title}`)}\n${data}${chalk.bgBlueBright(
        `<< ${title}`
      )}`
    )
  })

  process.stderr.on('data', (data) => {
    const title = `Electron stderr(pid:${process.pid})`
    console.log(
      `${chalk.bgRedBright(`>> ${title}`)}\n${data}${chalk.bgRedBright(
        `<< ${title}`
      )}`
    )
  })

  return process
}

let electronProcess: ChildProcess | null = null
compiler.watch({}, (err, stats) => {
  if (err != null) {
    console.error(err)
  }
  if (stats != null) {
    console.log(
      stats.toString({
        colors: true,
      })
    )
  }

  if (electronProcess != null) {
    electronProcess.kill('SIGINT')
  }
  electronProcess = execute()
})
