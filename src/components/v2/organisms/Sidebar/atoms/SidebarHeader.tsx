import React from 'react'
import styled from '../../../../../lib/v2/styled'
import { AppComponent } from '../../../../../lib/v2/types'
import cc from 'classcat'
import { overflowEllipsis } from '../../../../../lib/v2/styled/styleFunctions'

interface SidebarHeaderProps {
  label: string
}

const SidebarHeader: AppComponent<SidebarHeaderProps> = ({
  className,
  children,
  label,
}) => {
  return (
    <Container className={cc(['sidebar__header', className])}>
      <h4>{label}</h4>
      {children != null && (
        <div className='sidebar__header__children'>{children}</div>
      )}
    </Container>
  )
}

const Container = styled.div`
  &.sidebar__header {
    display: flex;
    justify-content: space-between;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
    align-items: center;

    & > h4 {
      flex: 1 1 20px;
      display: flex;
      align-items: center;
      margin: 0;
      font-weight: 400;
      height: 40px;
      ${overflowEllipsis};
    }

    .sidebar__header__children {
      flex: 0 0 auto;
    }
  }
`

export default SidebarHeader
