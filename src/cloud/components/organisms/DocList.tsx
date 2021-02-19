import React from 'react'
import { SerializedDocWithBookmark } from '../../interfaces/db/doc'
import { SerializedTeam } from '../../interfaces/db/team'
import DocListItem from '../molecules/DocListItem'
import styled from '../../lib/styled'
import { getHexFromUUID } from '../../lib/utils/string'
import { useUpDownNavigationListener } from '../../lib/keyboard'

interface DocListProps {
  docs: SerializedDocWithBookmark[]
  team: SerializedTeam
  emptyMessage?: string
}

const DocList = ({
  docs,
  team,
  emptyMessage = 'There are no documents',
}: DocListProps) => {
  const listRef = React.createRef<HTMLDivElement>()
  useUpDownNavigationListener(listRef)
  return (
    <StyledDocList>
      <StyledDocListContentWrapper>
        {docs.length > 0 ? (
          <StyledDocListContent ref={listRef}>
            {docs.map((doc) => {
              const childId = `docPage-dC${getHexFromUUID(doc.id)}`
              return (
                <DocListItem
                  item={doc}
                  key={doc.id}
                  team={team}
                  showUpdatedDate={true}
                  id={childId}
                />
              )
            })}
          </StyledDocListContent>
        ) : (
          <p className='empty'>{emptyMessage}</p>
        )}
      </StyledDocListContentWrapper>
    </StyledDocList>
  )
}

export default DocList

const StyledDocList = styled.div`
  svg {
    font-size: ${({ theme }) => theme.fontSizes.xlarge}px;
    vertical-align: middle !important;
  }

  .controls svg {
    transform: translateY(0) !important;
  }

  .itemLink {
    padding: ${({ theme }) => theme.space.xsmall}px;
  }

  .label {
    padding-left: ${({ theme }) => theme.space.xsmall}px;
    margin-bottom: 0;
  }

  .empty {
    margin-top: ${({ theme }) => theme.space.default}px;
  }
`

const StyledDocListContentWrapper = styled.div`
  width: 100%;
  margin: auto;

  p {
    color: ${({ theme }) => theme.baseTextColor};
    font-size: ${({ theme }) => theme.fontSizes.small}px;
  }
`

const StyledDocListContent = styled.div`
  .marginLeft {
    margin-left: 0 !important;
  }

  .sideNavItemStyle {
    border-bottom: 1px solid ${({ theme }) => theme.subtleBorderColor};
    padding: ${({ theme }) => theme.space.xsmall}px 0px;
    align-items: flex-start;
    justify-content: initial;
    flex-direction: column;
    height: auto;

    &:not(.non-hover):hover {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
    }

    &:not(.non-hover):focus,
    &:not(.non-hover):active,
    &:not(.non-hover).active {
      background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
    }

    &:not(.non-hover).focused {
      background-color: transparent;
    }
  }

  .sideNavWrapper {
    width: 100%;
    flex: inherit;
    padding: 0 ${({ theme }) => theme.space.xxsmall}px;
  }

  .controls {
    padding-left: 0;
  }

  .itemLink {
    padding: 0 ${({ theme }) => theme.space.xsmall}px;

    > div {
      font-size: ${({ theme }) => theme.fontSizes.default}px;
      white-space: inherit;
    }
  }
`
