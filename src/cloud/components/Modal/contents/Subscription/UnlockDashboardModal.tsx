import React from 'react'
import styled from '../../../../../design/lib/styled'
import { useSettings } from '../../../../lib/stores/settings'
import { useModal } from '../../../../../design/lib/stores/modal'
import { usePage } from '../../../../lib/stores/pageStore'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import Button from '../../../../../design/components/atoms/Button'

const UnlockDashboardModal = ({
  type = 'dashboard',
}: {
  type?: 'dashboard' | 'smartview'
}) => {
  const { openSettingsTab } = useSettings()
  const { closeAllModals } = useModal()
  const { team, subscription } = usePage()
  const { translate } = useI18n()

  if (team == null) {
    return null
  }

  if (subscription != null) {
    return (
      <Container className='sub__modal'>You are already subscribed</Container>
    )
  }

  return (
    <Container className='sub__modal'>
      <header className='sub__modal__header'>
        <div className='sub__modal__title'>
          {type === 'dashboard'
            ? translate(lngKeys.ModalUnlockDashboardsTitle)
            : translate(lngKeys.ModalUnlockSmartviewsTitle)}
        </div>
        <img
          src='/app/static/images/unlimited_dashboards.png'
          className='sub__img'
        />
        <div className='sub__modal__description'>
          <p>
            {type === 'dashboard'
              ? translate(lngKeys.ModalUnlockDashboardsDescription)
              : translate(lngKeys.ModalUnlockSmartviewsDescription)}
          </p>
          <p>{translate(lngKeys.ModalUnlockCheckDetails)}</p>
        </div>
      </header>
      <Button
        variant='primary'
        className='sub__modal__button'
        onClick={() => {
          openSettingsTab('teamUpgrade')
          closeAllModals()
        }}
      >
        {translate(lngKeys.SettingsTeamUpgrade)}
      </Button>
      <Button
        variant='secondary'
        className='sub__modal__button'
        onClick={() => {
          closeAllModals()
        }}
      >
        {translate(lngKeys.GeneralCancel)}
      </Button>
    </Container>
  )
}

const Container = styled.div`
  .sub__img {
    width: 100%;
  }

  .sub__modal__title {
    margin: 0;
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
  }

  .sub__modal__button {
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    width: 100%;
    margin-left: 0;
  }

  .sub__modal__header > * + * {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .sub__modal__description {
    margin: ${({ theme }) => theme.sizes.spaces.df}px 0;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.df};
  }
`

export default UnlockDashboardModal