import React from 'react'
import styled from '../../../lib/styled'
import { AppComponent } from '../../../lib/types'
import cc from 'classcat'
import { LoadingButton } from '../../atoms/Button'

export interface ToolbarControlProps {
  iconPath?: string
  onClick?: (event: React.MouseEvent) => void
  disabled?: boolean
  spinning?: boolean
  label?: React.ReactNode
  className?: string
}

interface ToolbarProps {
  position?: 'absolute' | 'sticky' | 'fixed'
  controls?: ToolbarControlProps[]
}

const Toolbar: AppComponent<ToolbarProps> = ({
  children,
  className,
  controls = [],
}) => {
  return (
    <ToolbarRow className={cc(['toolbar', className])}>
      <div className='toolbar__wrapper'>
        {(controls || []).map((control, i) => (
          <LoadingButton
            key={`toolbar__tool--${i}`}
            className={cc(['toolbar__tool', control.className])}
            variant={'bordered'}
            iconPath={control.iconPath}
            onClick={control.onClick}
            disabled={control.disabled}
            spinning={control.spinning}
            iconSize={16}
          >
            {control.label}
          </LoadingButton>
        ))}
        {children}
      </div>
    </ToolbarRow>
  )
}

const ToolbarRow = styled.div`
  width: fit-content;
  min-height: 40px;
  background: ${({ theme }) => theme.colors.background.secondary};
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  bottom: 6px;
  border-radius: ${({ theme }) => theme.borders.radius}px;
  max-width: 96%;

  .toolbar__wrapper {
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px 0
      ${({ theme }) => theme.sizes.spaces.df}px;
    display: flex;
    align-items: center;
    height: 100%;
    flex: 0 1 auto;
    flex-wrap: wrap;
    justify-content: center !important;
  }

  .toolbar__wrapper > * {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .toolbar__tool {
    line-height: ;
  }
`

export default Toolbar
