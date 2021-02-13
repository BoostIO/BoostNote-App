import React from 'react'
import {
  StyledHeader,
  StyledHeaderTitle,
  StyledHeaderDescription,
  StyledVerticalScroller,
  StyledRevisionItem,
  StyledRevisionCreators,
  StyledRevisionDateTime,
  StyledWrapper,
} from './styled'
import Spinner from '../../../../../atoms/CustomSpinner'
import plur from 'plur'
import cc from 'classcat'
import { SerializedSubscription } from '../../../../../../interfaces/db/subscription'
import { SerializedRevision } from '../../../../../../interfaces/db/revision'
import { format } from 'date-fns'
import { useUpDownNavigationListener } from '../../../../../../lib/keyboard'
import Button from '../../../../../atoms/Button'
import styled from '../../../../../../lib/styled'
import { SerializedUserTeamPermissions } from '../../../../../../interfaces/db/userTeamPermissions'

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

const RevisionModalNavigator = ({
  revisions,
  revisionIndex,
  menuRef,
  fetching,
  setRevisionIndex,
  subscription,
  currentPage,
  totalPages,
  fetchRevisions,
  currentUserPermissions,
}: RevisionModalNavigatorProps) => {
  useUpDownNavigationListener(menuRef)

  return (
    <Container className='left' ref={menuRef}>
      <StyledHeader>
        <StyledHeaderTitle>Revision History</StyledHeaderTitle>
        <StyledHeaderDescription>
          {fetching ? (
            <Spinner />
          ) : (
            <span className='text-center'>
              {`${revisions.length}${currentPage !== totalPages ? '+ ' : ' '}`}
              {plur('version', revisions.length)}
            </span>
          )}
        </StyledHeaderDescription>
      </StyledHeader>
      <StyledVerticalScroller>
        {revisions.map((rev) => (
          <StyledRevisionItem
            key={rev.id}
            id={`rev-${rev.id}`}
            disabled={subscription == null && currentUserPermissions != null}
            className={cc([revisionIndex === rev.id && 'active'])}
            onClick={() => setRevisionIndex(rev.id)}
          >
            <StyledWrapper>
              <StyledRevisionCreators>
                {rev.creators.length === 0
                  ? 'unknown'
                  : rev.creators
                      .map((creator) => creator.displayName)
                      .join(',')}
              </StyledRevisionCreators>
            </StyledWrapper>
            <StyledRevisionDateTime>
              {format(new Date(rev.created), 'HH:mm, dd MMMM u')}
            </StyledRevisionDateTime>
          </StyledRevisionItem>
        ))}

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
      </StyledVerticalScroller>
    </Container>
  )
}

const Container = styled.div`
  #revision__navigator__load {
    display: block;
    margin: ${({ theme }) => theme.space.small}px auto;
  }
`

export default RevisionModalNavigator
