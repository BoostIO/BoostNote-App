import { mdiArrowBottomLeftBoldOutline, mdiTextBox } from '@mdi/js'
import plur from 'plur'
import React from 'react'
import Icon from '../../../design/components/atoms/Icon'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import styled from '../../../design/lib/styled'
import { overflowEllipsis } from '../../../design/lib/styled/styleFunctions'
import { SerializedDoc } from '../../interfaces/db/doc'
import { SerializedTeam } from '../../interfaces/db/team'
import { getDocTitle } from '../../lib/utils/patterns'
import DocLink from '../Link/DocLink'

interface BackLinksListProps {
  team: SerializedTeam
  docs: SerializedDoc[]
}

const BackLinksList = ({ docs, team }: BackLinksListProps) => {
  if (docs.length === 0) {
    return null
  }
  return (
    <MetadataContainerRow
      row={{
        label: `${docs.length} ${plur('Backlink', docs.length)}`,
        type: 'content',
        icon: mdiArrowBottomLeftBoldOutline,
        content: (
          <Container className='backlinks'>
            {docs.map((doc) => (
              <li key={doc.id} className='backlink'>
                <DocLink doc={doc} team={team} id={`backlink__${doc.id}`}>
                  <Icon
                    path={mdiTextBox}
                    size={16}
                    className='backlink__icon'
                  />
                  <span className='backlink__title'>{getDocTitle(doc)}</span>
                </DocLink>
              </li>
            ))}
          </Container>
        ),
      }}
    />
  )
}

const Container = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  list-style: none;
  padding: 0;

  li {
    margin: 0;

    a {
      display: flex;
      align-items: center;
      color: ${({ theme }) => theme.colors.text.secondary};
      text-decoration: none;
      width: 100%;
      overflow: hidden;

      &:focus,
      &:hover {
        color: ${({ theme }) => theme.colors.text.subtle};
      }
    }

    .backlink__icon {
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
      color: ${({ theme }) => theme.colors.text.subtle};
      flex: 0 0 auto;
    }

    span {
      ${overflowEllipsis}
    }
  }
`

export default BackLinksList
