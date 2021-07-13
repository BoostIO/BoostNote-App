import React from 'react'
import { SerializedTeam } from '../../../../../interfaces/db/team'
import { mdiClose } from '@mdi/js'
import cc from 'classcat'
import TagLink from '../../../../atoms/Link/TagLink'
import { SerializedTag } from '../../../../../interfaces/db/tag'
import styled from '../../../../../../shared/lib/styled'
import { LoadingButton } from '../../../../../../shared/components/atoms/Button'

interface DocTagsListItemProps {
  tag: SerializedTag
  team: SerializedTeam
  sending: boolean
  removing: string | undefined
  onDeleteHandler: (tagId: string) => void
  removable?: boolean
}

const DocTagsListItem = ({
  team,
  tag,
  sending,
  onDeleteHandler,
  removing,
  removable = true,
}: DocTagsListItemProps) => {
  return (
    <Container key={tag.id} className='doc__tags__list__item'>
      <TagLink
        tag={tag}
        team={team}
        className='doc__tags__list__item__link'
        tabIndex={-1}
      >
        {tag.text}
      </TagLink>
      {removable && (
        <LoadingButton
          variant='icon'
          spinning={removing === tag.id}
          iconPath={mdiClose}
          iconSize={16}
          size='sm'
          className={cc([
            sending && 'disabled',
            'doc__tags__list__item__remove',
          ])}
          onClick={() => onDeleteHandler(tag.id)}
        />
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 2px 5px;
  position: relative;
  margin: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 3px;
  vertical-align: middle;
  height: 32px;
  align-items: center;

  .doc__tags__list__item__remove {
    display: inline-block;
    cursor: pointer;
    margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    color: ${({ theme }) => theme.colors.text.subtle};
    &:hover,
    &:focus {
      color: ${({ theme }) => theme.colors.text.primary};
    }

    &disabled {
      pointer-events: none;
    }

    .button__spinner {
      border-color: ${({ theme }) => theme.colors.variants.primary.text};
      border-right-color: transparent;
    }
  }

  .doc__tags__list__item__link {
    display: inline-block;
    max-width: 200px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text.primary};
    text-decoration: none;
    &:hover,
    &:focus {
      opacity: 0.8;
    }
  }

  .tag-spinner {
    margin-top: -3px;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export default DocTagsListItem
