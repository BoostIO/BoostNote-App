import React from 'react'
import copy from 'copy-to-clipboard'
import { mdiContentCopy, mdiContentSave } from '@mdi/js'
import { flexCenter } from '../../../lib/styled/styleFunctions'
import { downloadBlob } from '../../../lib/download'
import styled from '../../../shared/lib/styled'
import Icon from '../../../shared/components/atoms/Icon'

const CodeFenceContainer = styled.div`
  position: relative;
`

const CodeFenceButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  height: 30px;
  width: 30px;
  box-sizing: border-box;
  font-size: 18px;
  outline: none;

  background-color: rgba(0, 0, 0, 0.3);
  ${flexCenter};

  border: none;
  cursor: pointer;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.colors.text.primary};
  &:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &:active,
  &.active {
    color: ${({ theme }) => theme.colors.text.subtle};
  }
`

const CodeFence = (
  props: React.HTMLProps<HTMLPreElement> & {
    'data-raw'?: unknown
    'data-ext'?: unknown
    'data-mime'?: unknown
  } = {}
) => {
  if (props.className != null && props.className!.includes('CodeMirror')) {
    const {
      'data-raw': dataRaw,
      'data-ext': dataExt,
      'data-mime': dataMime,
      ...otherProps
    } = props
    return (
      <CodeFenceContainer>
        <pre {...otherProps} />
        {typeof dataRaw === 'string' && dataRaw.length > 0 && (
          <>
            <CodeFenceButton
              onClick={() => {
                copy(dataRaw)
              }}
              title='Copy to Clipboard'
            >
              <Icon path={mdiContentCopy} />
            </CodeFenceButton>
            <CodeFenceButton
              onClick={() => {
                let filename = 'snippet'
                if (typeof dataExt === 'string' && dataExt.length > 0) {
                  filename += `.${dataExt}`
                }
                const mime =
                  typeof dataMime === 'string' && dataMime.length > 0
                    ? dataMime
                    : 'text/plain;charset=utf-8'
                const blob = new Blob([dataRaw], {
                  type: mime,
                })
                downloadBlob(blob, filename)
              }}
              title='Save to File'
              style={{ right: '30px' }}
            >
              <Icon path={mdiContentSave} />
            </CodeFenceButton>
          </>
        )}
      </CodeFenceContainer>
    )
  }

  return <pre {...props} />
}

export default CodeFence
