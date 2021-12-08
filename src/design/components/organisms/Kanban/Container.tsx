import { mdiDrag } from '@mdi/js'
import cc from 'classcat'
import React from 'react'
import styled from '../../../lib/styled'
import Button from '../../atoms/Button'

interface ContainerProps {
  style?: React.CSSProperties
  className?: string
  sorting?: boolean
  dragging?: boolean
  handleProps?: React.HTMLAttributes<any>
  header: React.ReactNode
}

const Container = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<ContainerProps>
>(
  (
    { sorting, dragging, handleProps, children, header, className, style },
    ref
  ) => {
    return (
      <StyledContainer
        style={style}
        className={cc([
          'kanban__list',
          className,
          sorting && 'sorting',
          dragging && 'dragging',
        ])}
        ref={ref}
      >
        <div className='kanban__list__header'>
          <div className='kanban__list__header__title'>{header}</div>
          <div {...handleProps} className='kanban__list__handle'>
            <Button variant='icon-secondary' iconPath={mdiDrag}></Button>
          </div>
        </div>
        <div>{children}</div>
      </StyledContainer>
    )
  }
)

const StyledContainer = styled.div`
  width: 250px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  & .kanban__list__header {
    display: flex;
    align-items: center;
    & .kanban__list__header__title {
      flex: 1 0 auto;
    }
    & .kanban__list__handle > button {
      cursor: grab;
    }
  }

  & .kanban__item {
    cursor: grab;
    margin: ${({ theme }) => theme.sizes.spaces.df}px 0;
  }
`

export default Container
