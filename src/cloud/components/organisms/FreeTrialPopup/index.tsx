import React, { useState, useCallback } from 'react'
import styled from '../../../lib/styled'
import CustomButton from '../../atoms/buttons/CustomButton'
import Flexbox from '../../atoms/Flexbox'
import Spinner from '../../atoms/CustomSpinner'
import { useToast } from '../../../lib/stores/toast'
import { startTeamFreeTrial } from '../../../api/teams/subscription/trial'
import { SerializedTeam } from '../../../interfaces/db/team'
import { usePage } from '../../../lib/stores/pageStore'
import { freeTrialPeriodDays } from '../../../lib/subscription'

interface FreeTrialPopupProps {
  team: SerializedTeam
  close: () => void
}

const FreeTrialPopup = ({ team, close }: FreeTrialPopupProps) => {
  const [sending, setSending] = useState(false)
  const { updateTeamSubscription } = usePage()
  const { pushAxiosErrorMessage } = useToast()

  const onCloseCallback = useCallback(() => {
    if (sending) {
      return
    }

    close()
  }, [close, sending])

  const onSubmit = useCallback(async () => {
    if (sending) {
      return
    }

    setSending(true)
    try {
      const { subscription } = await startTeamFreeTrial(team)
      updateTeamSubscription(subscription)
      close()
    } catch (error) {
      pushAxiosErrorMessage(error)
    }
    setSending(false)
  }, [sending, pushAxiosErrorMessage, updateTeamSubscription, team, close])

  return (
    <StyledFreeTrialPopup>
      <StyledFreeTrialPopupBackground onClick={onCloseCallback} />
      <StyledFreeTrialPopupContainer>
        <Flexbox flex='1 1 auto' direction='column' alignItems='flex-start'>
          <StyledFreeTrialTitle>Try the Pro Plan for free</StyledFreeTrialTitle>
          <p>
            You&apos;ll get access to most features of a paid Pro Plan such as
            unlimited documents, revision history, etc... for{' '}
            {freeTrialPeriodDays} days.
          </p>
          <p>No credit card information is necessary for now.</p>
        </Flexbox>
        <Flexbox flex='0 0 auto' direction='column'>
          <CustomButton
            variant='primary'
            className='btn'
            disabled={sending}
            onClick={onSubmit}
          >
            {sending ? (
              <Spinner className='relative spinner' />
            ) : (
              'Start Free Trial'
            )}
          </CustomButton>
          <CustomButton
            variant='inverse-secondary'
            className='btn'
            onClick={onCloseCallback}
            disabled={sending}
          >
            Cancel
          </CustomButton>
        </Flexbox>
      </StyledFreeTrialPopupContainer>
    </StyledFreeTrialPopup>
  )
}

const zIndex = 8010

const StyledFreeTrialPopup = styled.div`
  z-index: ${zIndex};
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`

const StyledFreeTrialPopupBackground = styled.div`
  z-index: ${zIndex + 1};
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.blackBackgroundColor};
  opacity: 0.7;
`
const StyledFreeTrialPopupContainer = styled.div`
  z-index: ${zIndex + 2};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ theme }) => theme.space.medium}px
    ${({ theme }) => theme.space.large}px;
  position: relative;
  max-width: 80vw;
  max-height: 80vh;
  width: 600px;
  height: 400px;
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  box-shadow: ${({ theme }) => theme.baseShadowColor};
  border-radius: 4px;
  overflow: auto;

  .btn {
    width: 100%;
    &.btn-primary {
      margin-bottom: ${({ theme }) => theme.space.xsmall}px;
    }
  }

  .spinner {
    border-color: ${({ theme }) => theme.whiteBorderColor};
    border-right-color: transparent;
  }
`

const StyledFreeTrialTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.space.default}px;
`

export default FreeTrialPopup
