const fs = require('fs')

const fillRegex = new RegExp(`fill=[\"\']\#[1234567890]*[\"\']`, 'g')

fs.readdir('src/components/icons', function(err, filenames) {
  if (err) {
    console.log(err)
    return
  }
  const exports = []
  filenames.forEach(function(filename) {
    exports.push(`export * from './${filename.split('.')[0]}'`)
    try {
      fs.readFile(`src/components/icons/${filename}`, 'utf8', function(
        err,
        data
      ) {
        if (err) {
          console.log(err)
          return
        }
        const removeFillAttributeSplit = data
          .replace('const Svg', 'const Icon')
          .replace('export default Svg', 'export default Icon')
          .replace('= props', '= (props: BoostnoteIconProps)')
          .split(fillRegex)
        const content = [
          `import { BoostnoteIconProps } from '../../lib/icons'`,
          removeFillAttributeSplit.join('fill="currentColor"')
        ].join(`\n`)

        fs.writeFile(
          `src/components/icons/${filename.replace('js', 'tsx')}`,
          content,
          function(err2) {
            if (err2) {
              console.log(err2)
              return
            }
          }
        )
      })
    } catch (err) {
      console.log('could not convert file')
    }
  })

  fs.writeFile('src/components/icons/index.tsx', exports.join('\n'), function(
    err
  ) {
    if (err) {
      console.log(err)
      return
    }
  })
})
