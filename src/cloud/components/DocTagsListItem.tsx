import React, { useMemo } from 'react'
import { SerializedTeam } from '../interfaces/db/team'
import { mdiClose } from '@mdi/js'
import cc from 'classcat'
import TagLink from './Link/TagLink'
import { SerializedTag } from '../interfaces/db/tag'
import styled from '../../design/lib/styled'
import { LoadingButton } from '../../design/components/atoms/Button'
import {
  getColorFromString,
  getTextColorFromBgColorHex,
} from '../lib/utils/string'

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
  const colors = useMemo(() => {
    const bg =
      tag.backgroundColor != null
        ? tag.backgroundColor
        : getColorFromString(tag.text)
    const text = getTextColorFromBgColorHex(bg)
    return { bg, text }
  }, [tag])

  return (
    <Container
      key={tag.id}
      className={cc([
        'doc__tags__list__item',
        colors.text === '#000'
          ? 'doc__tags__list__item--black'
          : 'doc__tags__list__item--white',
        className,
      ])}
      style={{
        backgroundColor: colors.bg,
      }}
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
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  border-radius: 3px;
  vertical-align: middle;
  min-height: 22px;
  flex: 0 1 auto;
  width: fit-content;
  align-items: center;

  .doc__tags__list__item__remove {
    height: 100%;
    align-items: center;
    display: inline-flex;
    height: min-content !important;
    padding: 0 3px;
    cursor: pointer;
    &:disabled {
      pointer-events: none;
    }
  }

  .doc__tags__list__item__link {
    display: inline-block;
    max-width: 200px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
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

  &.doc__tags__list__item--black {
    color: #000;

    .doc__tags__list__item__remove {
      color: #000 !important;
      opacity: 0.8;

      &:hover,
      &:focus {
        opacity: 1;
      }

      .button__spinner {
        border-color: #000;
        border-right-color: transparent;
      }
    }

    .doc__tags__list__item__link {
      color: #000;
    }
  }

  &.doc__tags__list__item--white {
    color: #fff;

    .doc__tags__list__item__remove {
      color: #fff !important;
      opacity: 0.8;

      &:hover,
      &:focus {
        opacity: 1;
      }

      .button__spinner {
        border-color: #fff;
        border-right-color: transparent;
      }
    }

    .doc__tags__list__item__link {
      color: #fff;
    }
  }
`

export default DocTagsListItem
