import React from 'react'
import { usePage } from '../../lib/stores/pageStore'
import { useNav } from '../../lib/stores/nav'
import BreadCrumbs from './RightSideTopBar/BreadCrumbs'
import Application from '../Application'
import DocList from './DocList'

const GuestPage = () => {
  const { team } = usePage()
  const { docsMap } = useNav()

  if (team == null) {
    return <Application content={{}} />
  }

  return (
    <Application
      content={{
        reduced: true,
        topbar: {
          type: 'v1',
          left: <BreadCrumbs team={team} />,
        },
        header: <span style={{ marginRight: 10 }}>Shared documents</span>,
      }}
    >
      <DocList docs={[...docsMap.values()]} team={team} />
    </Application>
  )
}

export default GuestPage
