import React, { useMemo } from 'react'
import Page from '../../components/Page'
import { LazyDefaultLayout } from '../../components/layouts/DefaultLayout'
import AppLayout from '../../components/layouts/AppLayout'
import {
  getTimelinePageData,
  TimelinePageData,
} from '../../api/pages/teams/timeline'
import { isSameDay, isBefore, subDays, formatDistanceToNow } from 'date-fns'
import { partition } from 'ramda'
import TimelineList from '../../components/molecules/Timeline/TimelineList'
import styled from '../../lib/styled'
import TeamLink from '../../components/atoms/Link/TeamLink'
import { linkText } from '../../lib/styled/styleFunctions'
import PageHeader from '../../components/molecules/PageHeader'
import { mdiClockOutline } from '@mdi/js'
import { usePage } from '../../lib/stores/pageStore'
import { buildIconUrl } from '../../api/files'
import { SerializedUser } from '../../interfaces/db/user'
import { getColorFromString } from '../../lib/utils/string'
import IconMdi from '../../components/atoms/IconMdi'
import { GetInitialPropsParameters } from '../../interfaces/pages'

export interface TimelineUser {
  user: SerializedUser
  icon: React.ReactNode
  color: string
}

const TimelinePage = ({ team, events }: TimelinePageData) => {
  const { permissions = [] } = usePage()

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

  if (today.length + thisWeek.length + others.length === 0) {
    return (
      <Page>
        <LazyDefaultLayout>
          <AppLayout
            rightLayout={{
              className: 'reduced-width',
              topbar: {
                left: (
                  <>
                    <IconMdi path={mdiClockOutline} />
                    <span style={{ marginLeft: '5px' }}>Timeline</span>
                  </>
                ),
              },
              header: (
                <PageHeader title='Timeline' iconVariant={mdiClockOutline} />
              ),
            }}
          >
            <StyledTimelinePage>
              <p className='no-document'>
                No documents have been created. Share your knowledge with your
                teammates!
              </p>
            </StyledTimelinePage>
          </AppLayout>
        </LazyDefaultLayout>
      </Page>
    )
  }

  return (
    <Page>
      <LazyDefaultLayout>
        <AppLayout
          rightLayout={{
            className: 'reduced-width',
            topbar: {
              left: (
                <>
                  <IconMdi path={mdiClockOutline} />
                  <span style={{ marginLeft: '5px' }}>Timeline</span>
                </>
              ),
            },
            header: (
              <PageHeader title='Timeline' iconVariant={mdiClockOutline} />
            ),
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
            />

            <TimelineList
              heading='More than 7 days ago'
              team={team}
              events={others}
              usersMap={usersMap}
            />
            {events.length !== 10 && events.length % 10 === 0 && (
              <div className='more-button'>
                <TeamLink
                  team={team}
                  query={{ amount: Math.max(events.length, 20) + 10 }}
                  intent='timeline'
                >
                  Show More..
                </TeamLink>
              </div>
            )}
          </StyledTimelinePage>
        </AppLayout>
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
  }

  h1 {
    margin: ${({ theme }) => theme.space.large}px 0;
  }

  h2 {
    color: ${({ theme }) => theme.subtleTextColor};
    font-size: ${({ theme }) => theme.fontSizes.default}px;
    padding: ${({ theme }) => theme.space.xsmall}px 0;
    margin-top: ${({ theme }) => theme.space.large}px;
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
