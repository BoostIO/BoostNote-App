import React, { useMemo } from 'react'
import styled from '../../../../lib/styled'
import cc from 'classcat'
import { Emoji } from 'emoji-mart'
import Icon from '../../../atoms/Icon'
import { overflowEllipsis } from '../../../../lib/styled/styleFunctions'

interface FuzzyNavigationItemProps {
  item: FuzzyNavigationItemAttrbs
  id: string
  className?: string
  query?: string
}

export interface FuzzyNavigationItemAttrbs {
  label: string
  icon?: string
  emoji?: string
  path: string
  href?: string
  onClick: () => void
}

const FuzzyNavigationitem = ({
  id,
  className,
  item,
  query,
}: FuzzyNavigationItemProps) => {
  const Tag = item.href == null ? 'button' : 'a'

  const highlighted = useMemo(() => {
    if (query == null) {
      return {
        label: item.label,
        path: item.path,
      }
    }

    let parsingQuery = query
    let leftOvers = ''

    const minimizedLabel = item.label.toLocaleLowerCase()
    const minimizedPath = item.path.toLocaleLowerCase()
    const labelHighlightIndexes: { from: number; to: number }[] = []
    const pathHighlightIndexes: { from: number; to: number }[] = []

    while (parsingQuery !== '') {
      let match = minimizedLabel.indexOf(parsingQuery)

      if (match !== -1) {
        labelHighlightIndexes.push({
          from: match,
          to: parsingQuery.length + match,
        })
        parsingQuery = ''
        continue
      }

      match = minimizedPath.indexOf(parsingQuery)
      if (match !== -1) {
        pathHighlightIndexes.push({
          from: match,
          to: parsingQuery.length + match,
        })
        parsingQuery = ''
        continue
      }

      leftOvers = parsingQuery[parsingQuery.length - 1] + leftOvers
      parsingQuery = parsingQuery.slice(0, -1)
    }

    while (leftOvers !== '') {
      let match = minimizedLabel.indexOf(leftOvers)

      if (match !== -1) {
        labelHighlightIndexes.push({
          from: match,
          to: leftOvers.length + match,
        })
        leftOvers = ''
        continue
      }

      match = minimizedPath.indexOf(leftOvers)
      if (match !== -1) {
        pathHighlightIndexes.push({
          from: match,
          to: leftOvers.length + match,
        })
        leftOvers = ''
        continue
      }

      leftOvers = leftOvers.slice(0, -1)
    }

    return {
      label: getHighlightedNodes(item.label, labelHighlightIndexes),
      path: getHighlightedNodes(item.path, pathHighlightIndexes),
    }
  }, [item.label, item.path, query])
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
          <span className='fuzzy__navigation__item__label'>
            {highlighted.label}
          </span>
          <small className='fuzzy__navigation__path'>{highlighted.path}</small>
        </div>
      </Tag>
    </Container>
  )
}

function getHighlightedNodes(
  label: string,
  highlightIndexes: { from: number; to: number }[]
) {
  let res = <>{label}</>
  if (highlightIndexes.length > 0) {
    const sortedIndexes = Array.from(
      highlightIndexes.reduce((acc, val) => {
        acc.add(val.from)
        acc.add(val.to)
        return acc
      }, new Set<number>())
    ).sort((a, b) => {
      return a - b
    })
    res = (
      <>
        {sortedIndexes[0] !== 0 ? (
          <>{label.substr(0, sortedIndexes[0])}</>
        ) : null}
        {sortedIndexes.map((index, i) => {
          if (i % 2 !== 0) {
            return null
          }
          return (
            <mark key={i}>
              {label.substr(index, sortedIndexes[i + 1] - index)}
            </mark>
          )
        })}
        {sortedIndexes[sortedIndexes.length - 1] !== label.length ? (
          <>{label.substr(sortedIndexes[sortedIndexes.length - 1])}</>
        ) : null}
      </>
    )
  }
  return res
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

export default FuzzyNavigationitem
