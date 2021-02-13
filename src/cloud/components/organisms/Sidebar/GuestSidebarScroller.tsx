import React from 'react'
import styled from '../../../lib/styled'
import { useNav } from '../../../lib/stores/nav'
import Spinner from '../../atoms/CustomSpinner'
import { useSettings } from '../../../lib/stores/settings'
import { mdiCogOutline, mdiCircleSmall } from '@mdi/js'
import IconMdi from '../../atoms/IconMdi'
import SidebarTopButton from './SidebarTopButton'
import Flexbox from '../../atoms/Flexbox'
import { usePage } from '../../../lib/stores/pageStore'
import SidebarTopHeader from './SidebarTopHeader'
import SideNavigatorPlainDocItem from './SideNavigator/SideNavigatorPlainDocItem'

const GuestSidebarScroller = () => {
  const { currentUserPermissions } = usePage()
  const { initialLoadDone, docsMap } = useNav()
  const { openSettingsTab } = useSettings()

  if (currentUserPermissions != null) {
    return null
  }

  return (
    <Container>
      <div className='sidebar__padded'>
        <SidebarTopButton
          onClick={() => openSettingsTab('personalInfo')}
          id='sidebar-settings'
          variant='transparent'
          label={
            <>
              <IconMdi
                path={mdiCogOutline}
                size={19}
                style={{ marginRight: 4 }}
              />
              Settings
            </>
          }
          prependIcon={mdiCircleSmall}
        ></SidebarTopButton>
      </div>

      {initialLoadDone ? (
        <div className='sidebar__padded'>
          <SidebarTopHeader label='Shared' />
          {[...docsMap.values()].map((doc) => (
            <SideNavigatorPlainDocItem key={doc.id} item={doc} />
          ))}
        </div>
      ) : (
        <Flexbox justifyContent='center' style={{ marginTop: 20 }}>
          <Spinner />
        </Flexbox>
      )}
    </Container>
  )
}

export default GuestSidebarScroller

const Container = styled.div`
  overflow: hidden auto;
  margin-right: 0;
  margin-top: ${({ theme }) => theme.space.xsmall}px;
  margin-bottom: ${({ theme }) => theme.space.xsmall}px;
  width: 100%;
  flex: 1 1 auto;
  min-height: 200px;
  ::-webkit-scrollbar {
    display: none;
  }
  .sidebar__padded {
    width: 100%;
    padding: 0 ${({ theme }) => theme.space.small}px;
  }
`
