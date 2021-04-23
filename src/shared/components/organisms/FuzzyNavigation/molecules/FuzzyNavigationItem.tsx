import React from 'react'
import styled from '../../../../lib/styled'
import cc from 'classcat'
import { Emoji } from 'emoji-mart'
import Icon from '../../../atoms/Icon'
import { overflowEllipsis } from '../../../../lib/styled/styleFunctions'

interface FuzzyNavigationItemProps {
  item: FuzzyNavigationItemAttrbs
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

const FuzzyNavigationitem = ({
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
        <span className='fuzzy__navigation__item__label'>{item.label}</span>
        <small className='fuzzy__navigation__path'>{item.path}</small>
      </Tag>
    </Container>
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
  }

  a[href].fuzzy__navigation__item {
    cursor: pointer;
  }

  .fuzzy__navigation__item__label {
    flex: 0 1 auto;
    text-align: left;
    margin: 0;
    overflow: hidden;
    svg {
      color: ${({ theme }) => theme.colors.text.link};
    }
    .fuzzy__navigation__item__label {
      ${overflowEllipsis};

      span {
        line-height: ${({ theme }) => theme.sizes.fonts.l}px;
      }
    }
  }

  .fuzzy__navigation__path {
    flex: 1 2 auto;
    color: ${({ theme }) => theme.colors.text.subtle};
    padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export default FuzzyNavigationitem
