import React, {
  DragEventHandler,
  FocusEventHandler,
  MouseEventHandler,
  useCallback,
} from 'react'
import styled from '../../lib/styled'
import cc from 'classcat'
import Icon from './Icon'
import { mdiOpenInNew } from '@mdi/js'
import { useElectron } from '../../../cloud/lib/stores/electron'

export interface HyperLinkProps {
  id?: string
  href: string
  className?: string
  tabIndex?: number
  onContextMenu?: MouseEventHandler
  onFocus?: FocusEventHandler
  draggable?: boolean
  onDragStart?: DragEventHandler
  onDrop?: DragEventHandler
  onDragOver?: DragEventHandler
  onClick?: MouseEventHandler
}

export const ExternalLink: React.FC<
  HyperLinkProps & { showIcon?: boolean }
> = ({ className, children, showIcon, ...props }) => (
  <Container
    className={cc(['link', showIcon && `link--flex`, className])}
    rel='noopener noreferrer'
    target='_blank'
    {...props}
  >
    {children}
    {showIcon && <Icon size={16} path={mdiOpenInNew} />}
  </Container>
)

const Link: React.FC<HyperLinkProps & { onClick: MouseEventHandler }> = ({
  className,
  children,
  ...props
}) => {
  const { sendToElectron, usingElectron } = useElectron()
  const onClickHandler = useCallback(
    (event) => {
      if (event.shiftKey && props.onClick == null) {
        // call new window webview event
        if (usingElectron) {
          sendToElectron('new-window', props.href)
          return
        }
      }

      if (props.onClick != null) {
        props.onClick(event)
      }
    },
    [props, sendToElectron, usingElectron]
  )

  return (
    <Container
      className={cc(['link', className])}
      {...props}
      onClick={onClickHandler}
    >
      {children}
    </Container>
  )
}

export default Link

const Container = styled.a`
  display: inline;
  transition: 200ms color;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text.link};
  padding: 0 2px;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text.link};
    text-decoration: underline;
  }

  &:focus {
    color: ${({ theme }) => theme.colors.text.link};
    opacity: 0.8;
  }

  &.link--flex {
    display: inline-flex;
    align-items: center;
    .icon {
      flex: 0 0 auto;
      margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
  }
`
