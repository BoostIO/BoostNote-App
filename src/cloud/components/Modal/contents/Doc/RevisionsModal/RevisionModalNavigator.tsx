import React, { useMemo } from 'react'
import { SerializedSubscription } from '../../../../../interfaces/db/subscription'
import { SerializedRevision } from '../../../../../interfaces/db/revision'
import { SerializedUserTeamPermissions } from '../../../../../interfaces/db/userTeamPermissions'
import styled from '../../../../../../design/lib/styled'
import { isFocusLeftSideShortcut } from '../../../../../../design/lib/shortcuts'
import {
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
  useUpDownNavigationListener,
} from '../../../../../../design/lib/keyboard'
import { focusFirstChildFromElement } from '../../../../../../design/lib/dom'
import Spinner from '../../../../../../design/components/atoms/Spinner'
import plur from 'plur'
import Scroller from '../../../../../../design/components/atoms/Scroller'
import NavigationItem from '../../../../../../design/components/molecules/Navigation/NavigationItem'
import Flexbox from '../../../../../../design/components/atoms/Flexbox'
import { format } from 'date-fns'
import UserIcon from '../../../../UserIcon'
import Button from '../../../../../../design/components/atoms/Button'
import ColoredBlock from '../../../../../../design/components/atoms/ColoredBlock'
import {
  revisionHistoryFreeDays,
  revisionHistoryStandardDays,
} from '../../../../../lib/subscription'
import { useSettings } from '../../../../../lib/stores/settings'
import { useModal } from '../../../../../../design/lib/stores/modal'

interface RevisionModalNavigatorProps {
  revisions: SerializedRevision[]
  revisionIndex?: number
  fetching: boolean
  currentUserPermissions?: SerializedUserTeamPermissions
  menuRef: React.RefObject<HTMLDivElement>
  setRevisionIndex: (index: number) => void
  subscription?: SerializedSubscription
  currentPage: number
  totalPages: number
  fetchRevisions: (page: number) => void
}

const RevisionModalNavigator = React.forwardRef<
  HTMLButtonElement,
  RevisionModalNavigatorProps
>(
  ({
    currentUserPermissions,
    menuRef,
    fetching,
    revisions,
    currentPage,
    totalPages,
    setRevisionIndex,
    revisionIndex,
    fetchRevisions,
    subscription,
  }) => {
    const { openSettingsTab } = useSettings()
    const { closeAllModals } = useModal()
    const keydownHandler = useMemo(() => {
      return (event: KeyboardEvent) => {
        if (isFocusLeftSideShortcut(event)) {
          preventKeyboardEventPropagation(event)
          focusFirstChildFromElement(menuRef.current)
          return
        }
      }
    }, [menuRef])
    useGlobalKeyDownHandler(keydownHandler)
    useUpDownNavigationListener(menuRef)

    return (
      <Container className='revision__navigator' ref={menuRef}>
        <header>
          <h2>Revision History</h2>
          <div className='revision__navigator__description'>
            {fetching ? (
              <Spinner />
            ) : (
              <span className='text-center'>
                {`${revisions.length}${
                  currentPage !== totalPages ? '+ ' : ' '
                }`}
                {plur('version', revisions.length)}
              </span>
            )}
          </div>
        </header>

        <Scroller className='revisions__scroller'>
          {revisions.map((rev) => (
            <NavigationItem
              key={rev.id}
              id={`rev-${rev.id}`}
              active={revisionIndex === rev.id}
              labelClick={() => setRevisionIndex(rev.id)}
              label={format(new Date(rev.created), 'HH:mm, dd MMMM u')}
              borderRadius={true}
              icon={{
                type: 'node',
                icon: (
                  <Flexbox alignItems='center'>
                    {rev.creators.map((user) => (
                      <UserIcon
                        user={user}
                        key={`${rev.id}-${user.id}`}
                        className='user__icon'
                      />
                    ))}
                  </Flexbox>
                ),
              }}
            />
          ))}
        </Scroller>
        {currentPage < totalPages && (
          <Button
            variant='secondary'
            onClick={() => fetchRevisions(currentPage + 1)}
            disabled={fetching}
            id='revision__navigator__load'
          >
            Load more
          </Button>
        )}
        {(subscription == null || subscription.plan !== 'pro') && (
          <footer>
            <ColoredBlock variant='secondary'>
              <p>
                Under the {subscription == null ? 'free' : 'standard'} plan, you
                can only access the revisions made in the last{' '}
                {subscription == null
                  ? revisionHistoryFreeDays
                  : revisionHistoryStandardDays}{' '}
                days.
              </p>
              <p>
                In order to access all versions of this doc, upgrading to the
                pro plan is necessary.
              </p>
              {currentUserPermissions != null &&
                currentUserPermissions.role === 'admin' && (
                  <Button
                    variant='primary'
                    onClick={() => {
                      openSettingsTab(
                        subscription == null
                          ? 'teamUpgrade'
                          : 'teamSubscription'
                      )
                      return closeAllModals()
                    }}
                  >
                    Upgrade for full history
                  </Button>
                )}
            </ColoredBlock>
          </footer>
        )}
      </Container>
    )
  }
)

const Container = styled.div`
  width: 200px;
  height: 100%;
  border-right: 1px solid ${({ theme }) => theme.colors.border.main};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  footer {
    display: block;
    flex: 0 0 auto;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    p + p {
      margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
    }
    button {
      margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
      width: 100%;
    }
  }

  header,
  footer,
  .revisions__scroller {
    padding-right: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  header {
    display: block;
    text-align: center;
    flex: 0 0 auto;

    h2 {
      margin: 0;
      font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    }

    .revision__navigator__description {
      font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
      color: ${({ theme }) => theme.colors.text.subtle};
      margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
  }

  #revision__navigator__load {
    display: block;
    margin: ${({ theme }) => theme.sizes.spaces.sm}px auto;
  }

  .user__icon {
    width: 18px;
    height: 18px;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    line-height: 15px;
  }

  .navigation__item__label__ellipsis {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .revisions__scroller {
    flex: 1 1 auto;
  }
`

export default RevisionModalNavigator
