import React from 'react'
import { SerializedTeam } from '../interfaces/db/team'
import { mdiClose } from '@mdi/js'
import cc from 'classcat'
import TagLink from './Link/TagLink'
import { SerializedTag } from '../interfaces/db/tag'
import styled from '../../design/lib/styled'
import { LoadingButton } from '../../design/components/atoms/Button'

interface DocTagsListItemProps {
  tag: SerializedTag
  showLink?: boolean
  team: SerializedTeam
  sending?: boolean
  removing?: string
  className?: string
  onDeleteHandler?: (tagId: string) => void
}

const DocTagsListItem = ({
  team,
  tag,
  className,
  showLink = true,
  sending,
  onDeleteHandler,
  removing,
}: DocTagsListItemProps) => {
  return (
    <Container
      key={tag.id}
      className={cc(['doc__tags__list__item', className])}
    >
      {showLink ? (
        <TagLink
          tag={tag}
          team={team}
          className='doc__tags__list__item__link'
          tabIndex={-1}
        >
          {tag.text}
        </TagLink>
      ) : (
        <span
          className='doc__tags__list__item__link doc__tags__list__item__link--text'
          tabIndex={-1}
        >
          {tag.text}
        </span>
      )}
      {onDeleteHandler != null && (
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
  display: inline-flex;
  flex-wrap: wrap;
  padding: 0.25em 0.5em;
  position: relative;
  margin: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 3px;
  vertical-align: middle;
  align-items: flex-start;
  height: 22px;
  flex: 0 1 auto;
  width: fit-content;

  .doc__tags__list__item__remove {
    height: 100%;
    display: inline-block;
    cursor: pointer;
    margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    color: ${({ theme }) => theme.colors.text.subtle};
    &:hover,
    &:focus {
      color: ${({ theme }) => theme.colors.text.primary};
    }

    &:disabled {
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
    &:not(.doc__tags__list__item__link--text):hover,
    &:not(.doc__tags__list__item__link--text):focus {
      opacity: 0.8;
    }
  }

  .tag-spinner {
    margin-top: -3px;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export default DocTagsListItem
