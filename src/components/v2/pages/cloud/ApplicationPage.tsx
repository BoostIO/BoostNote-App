import {
  mdiAccountMultiplePlusOutline,
  mdiClockOutline,
  mdiCogOutline,
  mdiDownload,
  mdiFileDocumentMultipleOutline,
  mdiLogoutVariant,
  mdiMagnify,
  mdiPlusCircleOutline,
} from '@mdi/js'
import { stringify } from 'querystring'
import React, { useCallback, useMemo, useState } from 'react'
import { buildIconUrl } from '../../../../cloud/api/files'
import { useNavigateToTeam } from '../../../../cloud/components/atoms/Link/TeamLink'
import ImportModal from '../../../../cloud/components/organisms/Modal/contents/Import/ImportModal'
import { useRouter } from '../../../../cloud/lib/router'
import { useGlobalData } from '../../../../cloud/lib/stores/globalData'
import { useModal } from '../../../../cloud/lib/stores/modal'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { usePreferences } from '../../../../cloud/lib/stores/preferences'
import { getHexFromUUID } from '../../../../cloud/lib/utils/string'
import { SidebarState } from '../../../../lib/v2/sidebar'
import RoundedImage from '../../atoms/RoundedImage'
import { SidebarContextRow, SidebarSpace } from '../../organisms/Sidebar'
import ApplicationLayout from '../../templates/ApplicationLayout'
import {
  usingElectron,
  sendToHost,
} from '../../../../cloud/lib/stores/electron'
import { getTeamURL } from '../../../../cloud/lib/utils/patterns'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ApplicationPageProps {}

const ApplicationPage: React.FC<ApplicationPageProps> = ({ children }) => {
  const [sidebarState, setSidebarState] = useState<SidebarState | undefined>(
    'tree'
  )
  const { team } = usePage()
  const {
    globalData: { teams, invites },
  } = useGlobalData()
  const navigateToTeam = useNavigateToTeam()
  const { openModal } = useModal()
  const { preferences, setPreferences } = usePreferences()
  const { push } = useRouter()

  const sidebarResize = useCallback(
    (leftWidth: number) => {
      setPreferences({
        sideBarWidth: leftWidth,
      })
    },
    [setPreferences]
  )

  const spaceBottomRows = useMemo(() => {
    return [
      {
        label: 'Create an account',
        icon: mdiPlusCircleOutline,
        linkProps: {
          href: `${process.env.BOOST_HUB_BASE_URL}/cooperate`,
          onClick: (event: React.MouseEvent) => {
            event.preventDefault()
            push(`/cooperate`)
          },
        },
      },
      {
        label: 'Download desktop app',
        icon: mdiDownload,
        linkProps: {
          href: 'https://github.com/BoostIO/BoostNote.next/releases/latest',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      },
      {
        label: 'Log out',
        icon: mdiLogoutVariant,
        linkProps: {
          href: '/api/oauth/signout',
          onClick: (event: React.MouseEvent) => {
            event.preventDefault()
            if (usingElectron) {
              sendToHost('sign-out')
            } else {
              window.location.href = `${process.env.BOOST_HUB_BASE_URL}/api/oauth/signout`
            }
          },
        },
      },
    ]
  }, [push])

  const spaces: SidebarSpace[] = useMemo(() => {
    const rows: SidebarSpace[] = []
    teams.forEach((globalTeam) => {
      rows.push({
        label: globalTeam.name,
        active: team?.id === globalTeam.id,
        icon:
          globalTeam.icon != null
            ? buildIconUrl(globalTeam.icon.location)
            : undefined,
        linkProps: {
          href: `${process.env.BOOST_HUB_BASE_URL}${getTeamURL(globalTeam)}`,
          onClick: (event: React.MouseEvent) => {
            event.preventDefault()
            navigateToTeam(globalTeam, 'index')
          },
        },
      })
    })

    invites.forEach((invite) => {
      const query = { t: invite.team.id, i: getHexFromUUID(invite.id) }
      rows.push({
        label: `${invite.team.name} (invited)`,
        icon:
          invite.team.icon != null
            ? buildIconUrl(invite.team.icon.location)
            : undefined,
        linkProps: {
          href: `${process.env.BOOST_HUB_BASE_URL}/invite?${stringify(query)}`,
          onClick: (event: React.MouseEvent) => {
            event.preventDefault()
            push(`/invite?${stringify(query)}`)
          },
        },
      })
    })

    return rows
  }, [navigateToTeam, teams, team, invites, push])

  const openContext = useCallback((state: SidebarState) => {
    setSidebarState((prev) => (prev === state ? undefined : state))
  }, [])

  const contextRows: SidebarContextRow[] = useMemo(() => {
    const rows: SidebarContextRow[] = []
    if (team != null) {
      rows.push({
        tooltip: 'Spaces',
        active: sidebarState === 'spaces',
        icon: (
          <RoundedImage
            size='sm'
            alt={team.name}
            url={
              team.icon != null ? buildIconUrl(team.icon.location) : undefined
            }
          />
        ),
        onClick: () => openContext('spaces'),
      })
    }
    rows.push({
      tooltip: 'Tree',
      active: sidebarState === 'tree',
      icon: mdiFileDocumentMultipleOutline,
      onClick: () => openContext('tree'),
    })
    rows.push({
      tooltip: 'Search',
      active: sidebarState === 'search',
      icon: mdiMagnify,
      onClick: () => openContext('search'),
    })
    rows.push({
      tooltip: 'Timeline',
      active: sidebarState === 'timeline',
      icon: mdiClockOutline,
      onClick: () => openContext('timeline'),
    })
    rows.push({
      tooltip: 'Import',
      icon: mdiDownload,
      position: 'bottom',
      onClick: () =>
        openModal(<ImportModal />, {
          classNames: 'largeW',
        }),
    })
    rows.push({
      tooltip: 'Members',
      active: sidebarState === 'members',
      icon: mdiAccountMultiplePlusOutline,
      position: 'bottom',
      onClick: () => openContext('members'),
    })
    rows.push({
      tooltip: 'Settings',
      active: sidebarState === 'settings',
      icon: mdiCogOutline,
      position: 'bottom',
      onClick: () => openContext('settings'),
    })

    return rows
  }, [sidebarState, openModal, team, openContext])

  return (
    <ApplicationLayout
      sidebarState={sidebarState}
      contextRows={contextRows}
      spaces={spaces}
      spaceBottomRows={spaceBottomRows}
      sidebarResize={sidebarResize}
      sidebarExpandedWidth={preferences.sideBarWidth}
    >
      {children}
    </ApplicationLayout>
  )
}

export default ApplicationPage
