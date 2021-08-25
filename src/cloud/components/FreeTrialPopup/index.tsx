import React, { useState, useCallback } from 'react'
import { startTeamFreeTrial } from '../../api/teams/subscription/trial'
import { SerializedTeam } from '../../interfaces/db/team'
import { usePage } from '../../lib/stores/pageStore'
import { freeTrialPeriodDays } from '../../lib/subscription'
import { useToast } from '../../../design/lib/stores/toast'
import Button, { LoadingButton } from '../../../design/components/atoms/Button'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import styled from '../../../design/lib/styled'
import Flexbox from '../../../design/components/atoms/Flexbox'

interface FreeTrialPopupProps {
  team: SerializedTeam
  close: () => void
}

const FreeTrialPopup = ({ team, close }: FreeTrialPopupProps) => {
  const [sending, setSending] = useState(false)
  const { updateTeamSubscription } = usePage()
  const { pushApiErrorMessage } = useToast()
  const { translate } = useI18n()

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
      pushApiErrorMessage(error)
    }
    setSending(false)
  }, [sending, pushApiErrorMessage, updateTeamSubscription, team, close])

  return (
    <StyledFreeTrialPopup>
      <StyledFreeTrialPopupBackground onClick={onCloseCallback} />
      <StyledFreeTrialPopupContainer>
        <Flexbox flex='1 1 auto' direction='column' alignItems='flex-start'>
          <StyledFreeTrialTitle>
            {translate(lngKeys.FreeTrialModalTitle)}
          </StyledFreeTrialTitle>
          <video
            src='/app/static/videos/pro-intro.mp4'
            className='intro-video'
            autoPlay
            muted
            loop
          ></video>
          <div className='intro-text'>
            <p>
              {translate(lngKeys.FreeTrialModalBody, {
                days: freeTrialPeriodDays,
              })}
            </p>
            <p>{translate(lngKeys.FreeTrialModalDisclaimer)}</p>
          </div>
        </Flexbox>
        <Flexbox flex='0 0 auto' direction='column' className='button__group'>
          <LoadingButton
            variant='primary'
            className='btn'
            disabled={sending}
            onClick={onSubmit}
            spinning={sending}
          >
            {translate(lngKeys.FreeTrialModalCTA)}
          </LoadingButton>
          <Button
            variant='bordered'
            className='btn'
            onClick={onCloseCallback}
            disabled={sending}
          >
            {translate(lngKeys.GeneralCancel)}
          </Button>
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
  .button__group {
    button {
      margin: 0;
    }

    button + button {
      margin-top: 8px;
    }
  }
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
  background-color: #000;
  opacity: 0.7;
`
const StyledFreeTrialPopupContainer = styled.div`
  z-index: ${zIndex + 2};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ theme }) => theme.sizes.spaces.md}px
    ${({ theme }) => theme.sizes.spaces.l}px;
  position: relative;
  max-width: 80vw;
  max-height: 80vh;
  width: 600px;
  height: 650px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  box-shadow: ${({ theme }) => theme.colors.shadow};
  border-radius: 4px;
  overflow: auto;

  .btn {
    width: 100%;
    &.btn-primary {
      margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
  }

  .intro-video {
    max-width: 100%;
  }

  .intro-text {
    margin: ${({ theme }) => theme.sizes.spaces.df}px 0;

    p {
      line-height: 1.6;
    }
  }
`

const StyledFreeTrialTitle = styled.h1`
  margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
  font-size: ${({ theme }) => theme.sizes.spaces.xl}px;
`

export default FreeTrialPopup
