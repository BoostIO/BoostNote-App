import React from 'react'
import cc from 'classcat'
import { usePage } from '../../lib/stores/pageStore'
import { useSettings } from '../../lib/stores/settings'
import styled from '../../../design/lib/styled'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import Button from '../../../design/components/atoms/Button'
import TeamSubLimit from '../settings/TeamSubLimit'

const SidebarSubscriptionCTA = ({}) => {
  const { subscription, team, currentSubInfo } = usePage()
  const { openSettingsTab } = useSettings()
  const { translate } = useI18n()

  if (
    (subscription != null && subscription.status === 'active') ||
    currentSubInfo == null ||
    team == null
  ) {
    return null
  }

  if (currentSubInfo.trialing) {
    return (
      <Container className={cc(['sub__limit'])}>
        <a
          className='upgrade-link'
          href='#'
          onClick={(e: any) => {
            e.preventDefault()
            openSettingsTab('teamUpgrade')
          }}
        >
          <h6>{translate(lngKeys.SettingsSubLimitTrialTitle)}</h6>
          <p className='note-limit'>
            {translate(lngKeys.SettingsSubLimitTrialDate, {
              date: currentSubInfo.info.formattedEndDate,
            })}
          </p>
          <p className='note-limit'>
            {translate(lngKeys.SettingsSubLimitTrialUpgrade)}
          </p>
        </a>
      </Container>
    )
  }

  return (
    <Container className={cc(['sub__limit'])}>
      <TeamSubLimit padded={false} />
    </Container>
  )
}

const Container = styled.nav`
  width: 98%;
  margin-top: ${({ theme }) => theme.sizes.spaces.l}px;

  .sub__limit__wrapper {
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
    padding: ${({ theme }) => theme.sizes.spaces.df}px;
    background-color: ${({ theme }) => theme.colors.background.secondary};
    border-radius: ${({ theme }) => theme.borders.radius}px;

    .plan__item__perk {
      position: relative;
      color: ${({ theme }) => theme.colors.text.secondary};
      display: flex;
      align-items: flex-start;

      &::before {
        content: '✓';
        display: block;
        color: ${({ theme }) => theme.colors.text.secondary};
        font-size: ${({ theme }) => theme.sizes.fonts.df}px;
        padding-right: ${({ theme }) => theme.sizes.spaces.sm}px;
        line-height: ${({ theme }) => theme.sizes.fonts.df}px;
      }
    }

    .plan__item__perk + .plan__item__perk,
    .plan__item__perk + button {
      margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
    }
  }

  h6 {
    margin: 0;
    color: ${({ theme }) => theme.colors.variants.primary.base};
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  }

  p {
    margin: ${({ theme }) => theme.sizes.spaces.sm}px 0;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .upgrade-link {
    display: block;
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
    padding: ${({ theme }) => theme.sizes.spaces.df}px;
    cursor: pointer;
    text-decoration: none;

    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }
  }

  .note-limit {
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  }

  .text-danger {
    color: ${({ theme }) => theme.colors.variants.danger.base};
  }
`

export default SidebarSubscriptionCTA
