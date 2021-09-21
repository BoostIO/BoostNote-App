import React from 'react'
import { usePreferences } from '../lib/stores/preferences'
import Button from '../../design/components/atoms/Button'
import { mdiArrowLeft, mdiArrowRight } from '@mdi/js'
import { AppComponent } from '../../design/lib/types'
import cc from 'classcat'
import styled from '../../design/lib/styled'
import { rightSideTopBarHeight } from '../../design/components/organisms/Topbar'

const SidebarToggleButton: AppComponent<{ id?: string }> = ({
  className,
  id,
}) => {
  const { preferences, setPreferences } = usePreferences()

  return (
    <Container>
      <Button
        variant='secondary'
        className={cc(['sidebar--toggle', className])}
        iconPath={preferences.sidebarIsHidden ? mdiArrowRight : mdiArrowLeft}
        iconSize={20}
        id={id}
        size='sm'
        onClick={() =>
          setPreferences((prev) => {
            return { sidebarIsHidden: !prev.sidebarIsHidden }
          })
        }
      />
    </Container>
  )
}

export default SidebarToggleButton

const Container = styled.div`
  position: fixed;
  top: calc(${rightSideTopBarHeight}px + 30px);
  left: -14px;
  opacity: 0.5;
  z-index: 1;

  &:hover {
    transition: all ease-in-out 0.3s;
    padding-left: 24px;
    opacity: 1;
  }
`
