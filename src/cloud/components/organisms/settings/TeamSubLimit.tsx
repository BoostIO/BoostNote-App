import React from 'react'
import cc from 'classcat'
import { usePage } from '../../../lib/stores/pageStore'
import { useSettings } from '../../../lib/stores/settings'
import styled from '../../../../shared/lib/styled'

const TeamSubLimit = ({
  padded = true,
  onLimitClick,
}: {
  padded?: boolean
  onLimitClick?: () => void
}) => {
  const { subscription, team, currentSubInfo } = usePage()
  const { openSettingsTab } = useSettings()

  if (
    (subscription != null && subscription.status === 'active') ||
    currentSubInfo == null ||
    team == null
  ) {
    return null
  }

  if (currentSubInfo.trialing) {
    return (
      <Container
        className={cc(['sub__limit', !padded && 'sub__limit--stripped'])}
      >
        <a
          className='upgrade-link'
          href='#'
          onClick={(e: any) => {
            e.preventDefault()
            if (onLimitClick != null) {
              onLimitClick()
              return
            }
            openSettingsTab('teamUpgrade')
          }}
        >
          <h6>Upgrade to go unlimited</h6>
          <p className='note-limit'>
            Your workspace&apos;s trial of the Pro plan lasts through{' '}
            {currentSubInfo.info.formattedEndDate}
          </p>
          <p className='note-limit'>
            You can upgrade at anytime during your trial.
          </p>
        </a>
      </Container>
    )
  }

  return (
    <Container
      className={cc(['sub__limit', !padded && 'sub__limit--stripped'])}
    >
      <a
        className='upgrade-link'
        href='#'
        onClick={(e: any) => {
          e.preventDefault()
          if (onLimitClick != null) {
            onLimitClick()
            return
          }
          openSettingsTab('teamUpgrade')
        }}
      >
        <p className='note-limit'>
          {currentSubInfo.info.progressLabel} notes used
        </p>
        <div className='progress-sm'>
          <div
            className={cc([
              'progress-bar',
              currentSubInfo.info.overLimit && 'over-limit',
            ])}
            style={{ width: `${currentSubInfo.info.rate}%` }}
          />
        </div>
        <p>{currentSubInfo.info.label}</p>
        {currentSubInfo.info.trialIsOver && (
          <p className='text-danger'>
            Your pro plan trial has ended. Please upgrade now
          </p>
        )}
      </a>
    </Container>
  )
}

const Container = styled.nav`
  width: 100%;
  margin-top: ${({ theme }) => theme.sizes.spaces.l}px;

  &.sub__limit--stripped {
    margin: 0;
    > * {
      margin: 0 !important;
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
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
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

  .progress-sm {
    display: block;
    position: relative;
    width: 100%;
    height: 3px;
    background-color: ${({ theme }) => theme.colors.background.quaternary};
    border-radius: 0.25rem;
    font-size: 0.75rem;
    overflow: hidden;
    text-align: center;
  }

  .progress-bar {
    flex-direction: column;
    justify-content: center;
    height: 3px;
    max-width: 100%;
    background-color: ${({ theme }) => theme.colors.background.primary};
    text-align: center;
    white-space: nowrap;
    transition: width 0.6s ease;

    &.over-limit {
      background-color: ${({ theme }) => theme.colors.variants.danger.base};
    }
  }

  .text-danger {
    color: ${({ theme }) => theme.colors.variants.danger.base};
  }
`

export default TeamSubLimit
