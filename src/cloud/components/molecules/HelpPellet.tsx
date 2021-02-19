import React from 'react'
import styled from '../../lib/styled'
import { useModal } from '../../lib/stores/modal'
import IconMdi from '../atoms/IconMdi'
import { mdiHelp } from '@mdi/js'
import Tooltip from '../atoms/Tooltip'
import { MetaKeyText } from '../../lib/keyboard'
import HelpModal from '../organisms/Modal/contents/HelpModal/HelpModal'

const HelpPellet = () => {
  const { openModal } = useModal()

  return (
    <StyledPosition>
      <Tooltip tooltip={`${MetaKeyText()} + H`} side='top'>
        <StyledPellet
          onClick={() =>
            openModal(<HelpModal currentTab='calendly' />, {
              classNames: 'large',
            })
          }
          id='sidebar-cheatsheet'
        >
          <IconMdi path={mdiHelp} />
        </StyledPellet>
      </Tooltip>
    </StyledPosition>
  )
}

const StyledPosition = styled.div`
  position: fixed;
  bottom: ${({ theme }) => theme.space.xsmall}px;
  right: ${({ theme }) => theme.space.default}px;
`

const StyledPellet = styled.button`
  border-radius: 50%;
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  border: 1px solid ${({ theme }) => theme.subtleBorderColor};
  box-shadow: ${({ theme }) => theme.baseShadowColor};
  font-size: 30px;
  width: 45px;
  height: 45px;
  color: ${({ theme }) => theme.subtleTextColor};
  transition: 0.2s;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
    color: ${({ theme }) => theme.baseTextColor};
  }

  svg {
    display: block;
    line-height: 45px;
    margin: auto;
  }
`

export default HelpPellet
