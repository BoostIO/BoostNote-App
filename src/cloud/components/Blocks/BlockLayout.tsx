import React, { PropsWithChildren } from 'react'
import { LoadingButton } from '../../../design/components/atoms/Button'
import WithTooltip from '../../../design/components/atoms/WithTooltip'
import styled from '../../../design/lib/styled'
import { generateId } from '../../../lib/string'
import cc from 'classcat'

interface BlockLayoutProps {
  isRootBlock?: boolean
  controls?: {
    id?: string
    disabled?: boolean
    active?: boolean
    icon?: React.ReactNode
    iconPath?: string
    onClick: (event: React.MouseEvent) => void
    tooltip?: string
    spinning?: boolean
  }[]
}

const BlockLayout = ({
  isRootBlock = false,
  children,
  controls = [],
}: PropsWithChildren<BlockLayoutProps>) => (
  <BlockLayoutContainer
    className={cc([
      'block__layout',
      !isRootBlock ? `block__layout--hover` : 'block__layout--static',
      controls.length === 0 && `block__layout--empty`,
    ])}
  >
    {controls.length > 0 && (
      <div className='block__layout__controls'>
        {controls.map((control) => (
          <WithTooltip
            tooltip={control.tooltip}
            side='bottom'
            key={generateId()}
          >
            <LoadingButton
              icon={control.icon}
              iconPath={control.iconPath}
              disabled={control.disabled}
              id={control.id}
              onClick={control.onClick}
              spinning={control.spinning}
              active={control.active}
              variant='icon'
              size='sm'
            />
          </WithTooltip>
        ))}
      </div>
    )}
    <div className='block__layout__content'>{children}</div>
  </BlockLayoutContainer>
)

function hexToRgb(hex: string) {
  try {
    return hex
      .replace(
        /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (_m, r, g, b) => '#' + r + r + g + g + b + b
      )
      .substring(1)
      .match(/.{2}/g)!
      .map((x) => parseInt(x, 16))
  } catch (error) {
    return ''
  }
}

const BlockLayoutContainer = styled.div`
  width: 100%;
  position: relative;
  z-index: 0;
  transition: all 0.3s ease-in-out;
  background: ${({ theme }) => theme.colors.background.primary};
  padding: ${({ theme }) => theme.sizes.spaces.md}px
    ${({ theme }) => theme.sizes.spaces.xl}px;

  .block__layout__controls {
    transition: all 0.3s ease-in-out;
    position: absolute;
    right: 5px;
    top: -13px;
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    background: ${({ theme }) => theme.colors.background.primary};
    border-radius: ${({ theme }) => theme.borders.radius}px;

    button + button {
      margin: 0;
    }
  }

  &.block__layout--hover {
    .block__layout__controls {
      display: none;
    }
    &:hover {
      .block__layout__controls {
        display: block;
      }

      &:not(.block__layout--empty) {
        background: ${({ theme }) => {
          const rgba = hexToRgb(theme.colors.background.secondary)
          return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, 0.4)`
        }};
      }
    }
  }

  &.block__layout--static {
  }
`

export default BlockLayout
