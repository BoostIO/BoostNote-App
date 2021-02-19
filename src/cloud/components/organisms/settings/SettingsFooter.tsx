import React, { useCallback } from 'react'
import { SectionFooter } from './styled'
import { useSettings } from '../../../lib/stores/settings'
import { useTranslation } from 'react-i18next'
import CustomButton from '../../atoms/buttons/CustomButton'
import { Spinner } from '../../atoms/Spinner'

interface SettingsFooterProps {
  onUpdate: () => void
  updating: boolean
  disabled: boolean
}

const SettingsFooter = ({
  onUpdate,
  updating,
  disabled,
}: SettingsFooterProps) => {
  const { setClosed } = useSettings()

  const onCancelHandler = useCallback(() => {
    setClosed(true)
  }, [setClosed])

  const { t } = useTranslation()

  return (
    <SectionFooter>
      <CustomButton
        variant='primary'
        onClick={onUpdate}
        style={{ marginRight: 10, maxWidth: 150, textAlign: 'center' }}
        disabled={disabled}
      >
        {updating ? <Spinner style={{ fontSize: 16 }} /> : t('general.update')}
      </CustomButton>
      <CustomButton onClick={onCancelHandler} variant='secondary'>
        {t('general.cancel')}
      </CustomButton>
    </SectionFooter>
  )
}

export default SettingsFooter
