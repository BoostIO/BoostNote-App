import React from 'react'
import styled from '../../lib/styled'
import cc from 'classcat'
import { RoundedImageProps } from '../atoms/RoundedImage'
import UserIconList from '../molecules/UserIconList'
import { getFormattedDateTime } from '../../../lib/time'
import Button from '../atoms/Button'
import Link from '../atoms/Link'
import { AppComponent } from '../../lib/types'

interface ShallowTimelineProps {
  rows: ShallowTimelineRow[]
  sourcePlaceholder: string
}

export type ShallowTimelineRow = {
  users: RoundedImageProps[]
  date: string
  source?: { label: string; href?: string; onClick: () => void } | string
}

const ShallowTimeline: AppComponent<ShallowTimelineProps> = ({
  className,
  rows,
  children,
  sourcePlaceholder,
}) => (
  <Container className={cc(['shallow__timeline', className])}>
    {rows.map(({ source = sourcePlaceholder, ...row }, i) => {
      const sourceLink =
        typeof source === 'string' ? (
          ` ${source}`
        ) : source.href != null ? (
          <Link
            href={source.href}
            onClick={source.onClick}
            id={`shallow__timeline__source__${i}`}
          >
            {source.label}
          </Link>
        ) : (
          <Button
            variant='link'
            id={`shallow__timeline__source__${i}`}
            onClick={source.onClick}
          >
            {source.label}
          </Button>
        )
      return (
        <li className='shallow__timeline__item' key={`timeline__item__${i}`}>
          {row.users.length > 0 ? (
            <div className='shallow__timeline__item__users'>
              <UserIconList
                users={row.users}
                subtleBorders={true}
                className='shallow__timeline__item__icons'
              />
              <span className='shallow__timeline__item__label'>
                {row.users.map((user) => user.alt).join(',')} updated{' '}
                {sourceLink}
              </span>
            </div>
          ) : (
            <div className='shallow__timeline__item__label'>
              Updated {sourceLink}
            </div>
          )}
          <span className='shallow__timeline__item__date'>
            {getFormattedDateTime(row.date)}
          </span>
        </li>
      )
    })}

    {children}
  </Container>
)

const Container = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  .shallow__timeline__item + .shallow__timeline__item {
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;

    &::before {
      height: 15px;
      width: 1px;
      background-color: ${({ theme }) => theme.colors.border.second};
      content: '';
      position: absolute;
      left: 11px;
      top: -19px;
    }
  }

  .shallow__timeline__item__users {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .shallow__timeline__item {
    display: flex;
    flex-wrap: wrap;
    line-height: 18px;
    align-items: baseline;
    position: relative;
  }

  .shallow__timeline__item__icons {
    display: inline-block;
  }

  .shallow__timeline__item__icons + .shallow__timeline__item__label {
    padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .shallow__timeline__item__date {
    display: block;
    width: 100%;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  }
`

export default ShallowTimeline
