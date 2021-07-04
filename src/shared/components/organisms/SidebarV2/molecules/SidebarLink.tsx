import { uniqueId } from 'lodash'
import React, { useState } from 'react'
import styled from '../../../../lib/styled'
import Button from '../../../atoms/Button'
import cc from 'classcat'

interface SidebarLinkProps {
  label: string
  active?: boolean
  iconPath: string
  type: 'subtle' | 'transparent'
  onClick: () => void
}

const SidebarLink = ({ label, iconPath, type, onClick }: SidebarLinkProps) => {
  const [id] = useState(uniqueId('sidebarlink-'))
  return (
    <Container>
      <Button
        variant='transparent'
        size='sm'
        iconPath={iconPath}
        className={cc([
          'sidebar__link',
          type === 'subtle' && 'sidebar__link--silenced',
        ])}
        id={id}
        iconSize={16}
        onClick={onClick}
      >
        {label}
      </Button>
    </Container>
  )
}

const Container = styled.div`
  display: flex;

  .sidebar__link {
    flex: 1 1 auto;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    .button__label {
      flex: 0 1 auto;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  .sidebar__link.sidebar__link--silenced {
  }
`

export default SidebarLink
