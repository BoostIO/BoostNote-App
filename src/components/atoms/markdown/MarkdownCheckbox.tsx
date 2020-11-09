import React from 'react'

interface MarkdownCheckboxProps {
  index: number
  checked?: boolean
  updateContent?: (
    newValueOrUpdater: string | ((prevValue: string) => string)
  ) => void
}

const MarkdownCheckbox = ({
  index,
  checked = false,
  updateContent,
}: MarkdownCheckboxProps) => {
  const onChange = () => {
    if (updateContent == null) {
      return
    }
    updateContent((prevContent) => {
      const lines = prevContent.split('\n')

      let current = 0

      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex]
        // Matches both checked + unchecked
        const matches = line.match(/^(\s*>?)*\s*[+\-*] (\[x]|\[ ])/i)
        if (matches) {
          if (current === index) {
            const checked = /^(\s*>?)*\s*[+\-*] \[x]/i.test(matches[0])
            lines[lineIndex] = checked
              ? line.replace(/\[x\]/i, '[ ]')
              : line.replace('[ ]', '[x]')

            // Bail out early since we're done
            break
          } else {
            current++
          }
        }
      }
      return lines.join('\n')
    })
  }

  return <input type='checkbox' checked={checked} onChange={onChange} />
}

export default MarkdownCheckbox
