import { useRouter } from '../../router'
import { usePage } from '../../stores/pageStore'
import { SidebarSpace } from '../../../../design/components/organisms/Sidebar/molecules/SidebarSpaces'
import { useGlobalData } from '../../stores/globalData'
import { useMemo } from 'react'
import { getTeamURL } from '../../utils/patterns'
import { buildIconUrl } from '../../../api/files'
import { useNotifications } from '../../../../design/lib/stores/notifications'
import { getHexFromUUID } from '../../utils/string'
import { stringify } from 'yaml'
import { useI18n } from '../useI18n'
import { lngKeys } from '../../i18n/types'
import { capitalize } from 'lodash'
import { usingElectron } from '../../stores/electron'

export function useCloudSidebarSpaces() {
  const {
    globalData: { teams, invites },
  } = useGlobalData()
  const { team, permissions = [], subscription } = usePage()
  const { push } = useRouter()
  const { translate } = useI18n()

  const { counts } = useNotifications()
  const spaces: SidebarSpace[] = useMemo(() => {
    const rows: SidebarSpace[] = []
    teams.forEach((globalTeam) => {
      const href = `${process.env.BOOST_HUB_BASE_URL}${getTeamURL(globalTeam)}`
      const fullTeam =
        globalTeam.id === team?.id
          ? { ...team, subscription, permissions, active: true }
          : globalTeam

      const roles = fullTeam.permissions.reduce(
        (acc, val) => {
          if (val.role === 'viewer') {
            acc.viewers = acc.viewers + 1
          } else {
            acc.members = acc.members + 1
          }
          return acc
        },
        { viewers: 0, members: 0 }
      )

      rows.push({
        label: fullTeam.name,
        active: team?.id === fullTeam.id,
        notificationCount: counts[fullTeam.id],
        description: `${roles.members} ${translate(lngKeys.GeneralMembers)} ${
          roles.viewers > 0
            ? `- ${roles.viewers} ${capitalize(translate(lngKeys.Viewers))}`
            : ''
        }`,
        subscriptionPlan:
          fullTeam.subscription == null
            ? 'Free'
            : fullTeam.trial
            ? 'Trial'
            : fullTeam.subscription.plan,
        icon:
          fullTeam.icon != null
            ? buildIconUrl(fullTeam.icon.location)
            : undefined,
        linkProps: {
          href,
          onClick: (event: React.MouseEvent) => {
            event.preventDefault()
            if (usingElectron) {
              // todo: [komediruzecki-2021-10-12] Fix teams navigation in electron - this should be fine fix for now
              // sendToHost('request-app-navigate', `/${globalTeam.domain}`)
              push(href)
            } else {
              push(href)
            }
          },
        },
      })
    })

    if (!usingElectron) {
      invites.forEach((invite) => {
        const query = { t: invite.team.id, i: getHexFromUUID(invite.id) }
        const href = `${process.env.BOOST_HUB_BASE_URL}/invite?${stringify(
          query
        )}`
        rows.push({
          label: `${invite.team.name}`,
          description: '( Invited )',
          icon:
            invite.team.icon != null
              ? buildIconUrl(invite.team.icon.location)
              : undefined,
          linkProps: {
            href,
            onClick: (event: React.MouseEvent) => {
              event.preventDefault()
              push(`/invite?${stringify(query)}`)
            },
          },
        })
      })
    }

    return rows
  }, [counts, invites, teams, push, team, translate, permissions, subscription])

  return {
    spaces,
  }
}
