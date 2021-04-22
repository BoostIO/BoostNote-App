import React, { MouseEventHandler } from 'react'
import cc from 'classcat'
import styled from '../../../../../shared/lib/styled'
import { ControlButtonProps } from '../../../../../shared/lib/types'
import Checkbox from '../../../molecules/Form/atoms/FormCheckbox'
import { overflowEllipsis } from '../../../../../shared/lib/styled/styleFunctions'
import { getFormattedDateTime } from '../../../../../shared/lib/date'
import Badge from '../../../../../shared/components/atoms/Badge'
import { AppUser } from '../../../../../shared/lib/mappers/users'
import UserIconList from '../../../molecules/UserIconList'

interface ContentManagerRowProps {
  id: string
  className?: string
  checked: boolean
  toggleChecked: () => void
  label: string
  labelHref: string
  labelOnclick: MouseEventHandler
  controls?: ControlButtonProps[]
  lastUpdated: string
  lastUpdatedBy: AppUser[]
  badges?: string[]
}

const ContentManagerRow = ({
  id,
  className,
  checked,
  label,
  labelHref,
  labelOnclick,
  toggleChecked,
  controls,
  lastUpdated,
  badges,
  lastUpdatedBy,
}: ContentManagerRowProps) => {
  return (
    <Container className={cc(['content__manager__row', className])}>
      <div className='content__manager__row__wrapper'>
        <Checkbox
          className='content__manager__checkbox'
          checked={checked}
          toggle={toggleChecked}
        />
        <a
          className='content__manager__row__label'
          onClick={labelOnclick}
          href={labelHref}
          id={`row-${id}`}
          tabIndex={1}
        >
          <span className='content__manager__row__label__ellipsis'>
            {label}
            {badges != null &&
              badges.map((badge) => (
                <Badge
                  className='content__manager__row__badge'
                  key={`${id}-${badge}`}
                >
                  {badge}
                </Badge>
              ))}
          </span>
          <div className='content__manager__row__info'>
            <span className='content__manager__row__date'>
              {getFormattedDateTime(lastUpdated)}
            </span>
            {lastUpdatedBy.length > 0 && (
              <UserIconList
                className='content__manager__row__editors'
                hideBorders={true}
                users={lastUpdatedBy.map((user) => {
                  return {
                    url: user.iconUrl,
                    alt: user.name,
                    color: user.color,
                    size: 22,
                  }
                })}
              />
            )}
          </div>
        </a>
        {controls != null && (
          <div className='content__manager__row__actions'></div>
        )}
      </div>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  flex-direction: row;
  justify-content: space-between;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  .content__manager__row__actions,
  &:hover .content__manager__row__info {
    display: none;
  }

  .content__manager__row__editors {
    padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .content__manager__row__badge {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  &:hover {
    .content__manager__checkbox {
      opacity: 1 !important;
    }

    .content__manager__row__actions {
      display: flex;
    }
  }

  .content__manager__row__info {
    display: flex;
    align-items: center;
    flex: 0 2 auto;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .content__manager__row__info,
  .content__manager__row__actions {
    padding-right: ${({ theme }) => theme.sizes.spaces.df * 2}px;
  }

  .content__manager__row__actions {
    flex: 0 0 auto;
  }

  .content__manager__row__wrapper {
    width: 100%;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    padding-left: ${({ depth }) => 26 + (depth as number) * 20}px;
  }

  .content__manager__row__label {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    cursor: pointer;
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    background: none;
    outline: 0;
    border: 0;
    text-align: left;
    color: ${({ theme }) => theme.colors.text.primary};
    text-decoration: none;
    margin: 0;
    overflow: hidden;
    .content__manager__row__label__ellipsis {
      padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
      ${overflowEllipsis};
    }
  }
`

export default ContentManagerRow
