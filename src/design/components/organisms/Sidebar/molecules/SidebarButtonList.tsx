import React from 'react'
import styled from '../../../../lib/styled'
import { AppComponent } from '../../../../lib/types'
import cc from 'classcat'
import SidebarButton, { SidebarButtonProps } from '../atoms/SidebarButton'

export interface SidebarButtonListProps {
  rows: SidebarButtonProps[]
}

const SidebarButtonList: AppComponent<SidebarButtonListProps> = ({
  className,
  children,
  rows,
}) => {
  return (
    <Container className={cc([className, 'sidebar__button__list'])}>
      {children}
      {rows.map((row, i) => {
        return (
          <SidebarButton
            className='sidebar__button'
            key={`${row.id}-${i}`}
            {...row}
          />
        )
      })}
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.sizes.spaces.sm}px 13px !important;
  display: flex;
  flex-direction: column;

  .sidebar__button--primary + .sidebar__button {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

export default SidebarButtonList
