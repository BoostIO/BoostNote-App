import React, { useMemo } from 'react'
import Page from '../../components/Page'
import { LazyDefaultLayout } from '../../components/layouts/DefaultLayout'
import Application from '../../components/Application'
import {
  getTimelinePageData,
  TimelinePageData,
} from '../../api/pages/teams/timeline'
import { isSameDay, isBefore, subDays, formatDistanceToNow } from 'date-fns'
import { partition } from 'ramda'
import TimelineList from '../../components/molecules/Timeline/TimelineList'
import styled from '../../lib/styled'
import TeamLink, { getTeamLinkHref } from '../../components/atoms/Link/TeamLink'
import { linkText } from '../../lib/styled/styleFunctions'
import { mdiClockOutline } from '@mdi/js'
import { usePage } from '../../lib/stores/pageStore'
import { buildIconUrl } from '../../api/files'
import { SerializedUser } from '../../interfaces/db/user'
import { getColorFromString } from '../../lib/utils/string'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { useRouter } from '../../lib/router'
import EmojiIcon from '../../components/atoms/EmojiIcon'
import { topParentId } from '../../lib/mappers/topbarTree'
import { useNav } from '../../lib/stores/nav'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import InviteCTAButton from '../../components/molecules/InviteCTAButton'

export interface TimelineUser {
  user: SerializedUser
  icon: React.ReactNode
  color: string
}

const TimelinePage = ({ team, events }: TimelinePageData) => {
  const { push } = useRouter()
  const { permissions = [] } = usePage()
  const { workspacesMap } = useNav()
  const { translate } = useI18n()

  const { today, thisWeek, others } = useMemo(() => {
    const todayDate = new Date()
    const sevenDaysAgo = subDays(todayDate, 7)

    const [today, rest] = partition(
      (event) => isSameDay(new Date(event.createdAt), todayDate),
      events
    )

    const [thisWeek, others] = partition(
      (event) => isBefore(sevenDaysAgo, new Date(event.createdAt)),
      rest
    )

    return { today, thisWeek, others }
  }, [events])

  const usersMap = useMemo(() => {
    const map = new Map<string, TimelineUser>()
    permissions.forEach((permission) => {
      map.set(permission.user.id, {
        user: permission.user,
        icon:
          permission.user.icon != null ? (
            <img
              src={buildIconUrl(permission.user.icon.location)}
              alt={permission.user.displayName[0]}
            />
          ) : (
            permission.user.displayName[0]
          ),
        color: getColorFromString(permission.user.id),
      })
    })

    return map
  }, [permissions])

  const href = getTeamLinkHref(team, 'timeline')
  if (today.length + thisWeek.length + others.length === 0) {
    return (
      <Application
        content={{
          reduced: true,
          topbar: {
            breadcrumbs: [
              {
                label: translate(lngKeys.GeneralTimeline),
                active: true,
                parentId: topParentId,
                icon: mdiClockOutline,
                link: {
                  href,
                  navigateTo: () => push(href),
                },
              },
            ],
            controls: [
              {
                type: 'node',
                element: <InviteCTAButton />,
              },
            ],
          },
          header: (
            <>
              <EmojiIcon
                defaultIcon={mdiClockOutline}
                style={{ marginRight: 10 }}
                size={16}
              />
              <span style={{ marginRight: 10 }}>
                {translate(lngKeys.GeneralTimeline)}
              </span>
            </>
          ),
        }}
      >
        <StyledTimelinePage>
          <p className='no-document'>
            No documents have been created. Share your knowledge with your
            teammates!
          </p>
        </StyledTimelinePage>
      </Application>
    )
  }

  return (
    <Page>
      <LazyDefaultLayout>
        <Application
          content={{
            topbar: {
              breadcrumbs: [
                {
                  label: translate(lngKeys.GeneralTimeline),
                  active: true,
                  parentId: topParentId,
                  icon: mdiClockOutline,
                  link: {
                    href,
                    navigateTo: () => push(href),
                  },
                },
              ],
              controls: [
                {
                  type: 'node',
                  element: <InviteCTAButton />,
                },
              ],
            },
          }}
        >
          <StyledTimelinePage>
            {today.length > 0 ? (
              <TimelineList
                heading='Today'
                team={team}
                events={today}
                usersMap={usersMap}
                timeFormat={dateFormatDistanceToNow}
                workspacesMap={workspacesMap}
              />
            ) : (
              <>
                <h2>Today</h2>
                <p className='no-event'>No new events today!</p>
              </>
            )}
            <TimelineList
              heading='Past 7 days'
              team={team}
              events={thisWeek}
              usersMap={usersMap}
              workspacesMap={workspacesMap}
            />

            <TimelineList
              heading='More than 7 days ago'
              team={team}
              events={others}
              usersMap={usersMap}
              workspacesMap={workspacesMap}
            />
            {events.length !== 10 && events.length % 10 === 0 && (
              <div className='more-button'>
                <TeamLink
                  team={team}
                  query={{ amount: Math.max(events.length, 20) + 10 }}
                  intent='timeline'
                >
                  {translate(lngKeys.GeneralShowMore)}
                </TeamLink>
              </div>
            )}
          </StyledTimelinePage>
        </Application>
      </LazyDefaultLayout>
    </Page>
  )
}

TimelinePage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getTimelinePageData(params)
  return result
}

export default TimelinePage

function dateFormatDistanceToNow(date: Date) {
  return `${formatDistanceToNow(date)} ago`
}

const StyledTimelinePage = styled.div`
  padding-bottom: ${({ theme }) => theme.space.default}px;

  .no-event,
  .no-document {
    margin-top: ${({ theme }) => theme.space.default}px;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    padding: 0 ${({ theme }) => theme.space.default}px;
  }

  h1 {
    margin: ${({ theme }) => theme.space.large}px 0;
  }

  h2 {
    color: ${({ theme }) => theme.subtleTextColor};
    font-size: ${({ theme }) => theme.fontSizes.default}px;
    padding: ${({ theme }) => theme.space.xsmall}px
      ${({ theme }) => theme.space.xlarge}px;
    margin-top: ${({ theme }) => theme.space.medium}px;
    margin-bottom: 0;
    border-bottom: 1px solid ${({ theme }) => theme.subtleBorderColor};
  }

  .more-button {
    display: flex;
    justify-content: center;
    margin-top: ${({ theme }) => theme.space.default}px;

    > a {
      ${linkText}
    }
  }
`
