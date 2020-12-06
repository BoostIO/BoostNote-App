import React from 'react'
import styled from '../../../lib/styled'
import copy from 'copy-to-clipboard'
import Icon from '../Icon'
import { mdiContentCopy, mdiContentSave } from '@mdi/js'
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
  ${flexCenter}

  border: none;
  cursor: pointer;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.navButtonColor};
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  &.active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }
`
const CodeFence = (props: React.HTMLProps<HTMLPreElement> = {}) => {
  if (props.className != null && props.className!.includes('CodeMirror')) {
    const otherProps = { ...props }
    const rawContent = props['data-raw']
    delete otherProps['data-raw']
    return (
      <CodeFenceContainer>
        <pre {...otherProps} />
        <CodeFenceButton
          onClick={() => {
            copy(rawContent)
          }}
          title='Copy to Clipboard'
        >
          <Icon path={mdiContentCopy} />
        </CodeFenceButton>
        {rawContent && <CodeFenceButton
          onClick={() => {
            var blob = new Blob([rawContent], { type: "text/plain;charset=utf-8" });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            var ext = "";
            if(props.className!.includes('language-'))
              ext="."+/language-(.+?)$/.exec(props.className!)![1]
            link.download = "snippet" + ext;
            link.click();
          }}
          title='Save to File'
          style={{ right: '30px' }}
        >
          <Icon path={mdiContentSave} />
        </CodeFenceButton>}
      </CodeFenceContainer>
    )
  }

  return <pre {...props} />
}

export default CodeFence
