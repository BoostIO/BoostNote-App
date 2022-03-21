import React from 'react'
import copy from 'copy-to-clipboard'
import { mdiContentCopy, mdiContentSave } from '@mdi/js'
import { downloadBlob } from '../../../lib/dom'
import styled from '../../../lib/styled'
import Icon from '../Icon'
import { flexCenter } from '../../../lib/styled/styleFunctions'

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

const CodeFencePath = styled.div`
  display: block;
  width: fit-content;
  max-width: 80%;
  border-radius: 2px;
  margin-top: 1px;

  box-sizing: border-box;
  outline: none;
  word-break: break-all;
  word-wrap: break-word;
  white-space: pre-wrap;

  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  transform: translateY(-16px);
  padding-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
  padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
  padding-right: ${({ theme }) => theme.sizes.spaces.xsm}px;

  background-color: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};

  border: none;
`

const CodeFence = (
  props: React.HTMLProps<HTMLPreElement> & {
    'data-raw'?: unknown
    'data-ext'?: unknown
    'data-mime'?: unknown
    'data-path'?: unknown
  } = {}
) => {
  if (props.className != null && props.className!.includes('CodeMirror')) {
    const {
      'data-raw': dataRaw,
      'data-ext': dataExt,
      'data-mime': dataMime,
      'data-path': dataPath,
      ...otherProps
    } = props
    return (
      <CodeFenceContainer>
        <pre {...otherProps}>
          {typeof dataPath === 'string' && dataPath.length > 0 && (
            <CodeFencePath>{dataPath}</CodeFencePath>
          )}
          {otherProps.children}
        </pre>
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
