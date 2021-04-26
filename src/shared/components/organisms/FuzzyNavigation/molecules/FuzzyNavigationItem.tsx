import React, { useMemo } from 'react'
import styled from '../../../../lib/styled'
import cc from 'classcat'
import { Emoji } from 'emoji-mart'
import Icon from '../../../atoms/Icon'
import { overflowEllipsis } from '../../../../lib/styled/styleFunctions'
import shortid from 'shortid'

interface FuzzyNavigationItemProps {
  item: {
    label: React.ReactNode
    icon?: string
    emoji?: string
    path: React.ReactNode
    href?: string
    onClick: () => void
  }
  id: string
  className?: string
}

export interface FuzzyNavigationItemAttrbs {
  label: string
  icon?: string
  emoji?: string
  path: string
  href?: string
  onClick: () => void
}

const FuzzyNavigationItem = ({
  id,
  className,
  item,
}: FuzzyNavigationItemProps) => {
  const Tag = item.href == null ? 'button' : 'a'

  return (
    <Container className={cc(['fuzzy__navigation__item__wrapper', className])}>
      <Tag
        id={id}
        className='fuzzy__navigation__item'
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          item.onClick()
        }}
        href={item.href}
      >
        {item.emoji != null || item.icon != null ? (
          <div className='fuzzy__navigation__icon'>
            {item.emoji != null ? (
              <Emoji emoji={item.emoji} set='apple' size={16} />
            ) : (
              <Icon path={item.icon!} size={16} />
            )}
          </div>
        ) : null}
        <div className='fuzzy__navigation__item__label_wrapper'>
          <span className='fuzzy__navigation__item__label'>{item.label}</span>
          <small className='fuzzy__navigation__path'>{item.path}</small>
        </div>
      </Tag>
    </Container>
  )
}

type HighlightedFuzzyNavigationItemProps = {
  item: FuzzyNavigationItemAttrbs
  id: string
  className?: string
  query: string
  labelMatches?: readonly [number, number][]
  pathMatches?: readonly [number, number][]
}

export const HighlightedFuzzyNavigationitem = ({
  item,
  query,
  labelMatches = [],
  pathMatches = [],
  ...rest
}: HighlightedFuzzyNavigationItemProps) => {
  const highlighted = useMemo(() => {
    return {
      label: getHighlightedNodes(item.label, labelMatches),
      path: getHighlightedNodes(item.path, pathMatches),
    }
  }, [item.label, item.path, pathMatches, labelMatches])

  return (
    <FuzzyNavigationItem
      item={{ ...item, label: highlighted.label, path: highlighted.path }}
      {...rest}
    />
  )
}

const Container = styled.div`
  .fuzzy__navigation__item {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    text-decoration: none;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: baseline;
    background: none;
    outline: 0;
    border: 0;
    color: ${({ theme }) => theme.colors.text.primary};
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.md}px
      ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.md}px;

    &:hover {
      background-color: ${({ theme }) => theme.colors.background.quaternary};
    }

    &:focus,
    &.focused {
      background-color: ${({ theme }) => theme.colors.variants.primary.base};
      color: ${({ theme }) => theme.colors.variants.primary.text};
    }
  }

  .fuzzy__navigation__icon {
    flex: 0 0 auto;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    svg {
      color: ${({ theme }) => theme.colors.text.link};
    }
  }

  a[href].fuzzy__navigation__item {
    cursor: pointer;
  }

  .fuzzy__navigation__item__label_wrapper {
    flex: 1 1 auto;
    text-align: left;
    margin: 0;
    display: flex;
    align-items: baseline;
    ${overflowEllipsis};
  }

  .fuzzy__navigation__item__label,
  .fuzzy__navigation__path {
    ${overflowEllipsis};
  }

  .fuzzy__navigation__item__label {
    flex: 0 0 auto;
  }

  .fuzzy__navigation__path {
    flex: 1 1 auto;
    color: ${({ theme }) => theme.colors.text.subtle};
    padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .fuzzy__navigation__item__label_wrapper mark {
    background: none;
    color: ${({ theme }) => theme.colors.variants.primary.base};
    filter: brightness(180%);
  }
`

function getHighlightedNodes(
  label: string,
  highlightIndexes: readonly [number, number][]
) {
  if (highlightIndexes.length === 0) {
    return label
  }

  const sortedIndexes = Array.from(highlightIndexes).sort((a, b) => {
    if (a[0] === b[0]) {
      return a[1] - b[1]
    }
    return a[0] - b[0]
  })

  return (
    <>
      {sortedIndexes[0][0] !== 0 ? (
        <>{label.substr(0, sortedIndexes[0][0])}</>
      ) : null}
      {sortedIndexes.map((matchIndex, i) => {
        return (
          <React.Fragment key={`i-${shortid.generate()}`}>
            {i > 0 ? (
              <>
                {label.substr(
                  sortedIndexes[i - 1][1] + 1,
                  matchIndex[0] - sortedIndexes[i - 1][1] - 1
                )}
              </>
            ) : null}
            {
              <mark key={i}>
                {label.substr(matchIndex[0], matchIndex[1] - matchIndex[0] + 1)}
              </mark>
            }
          </React.Fragment>
        )
      })}
      {sortedIndexes[sortedIndexes.length - 1][1] + 1 < label.length ? (
        <>{label.substr(sortedIndexes[sortedIndexes.length - 1][1] + 1)}</>
      ) : null}
    </>
  )
}

export default FuzzyNavigationItem
