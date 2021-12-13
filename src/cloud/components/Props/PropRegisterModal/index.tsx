import { mdiArrowLeft } from '@mdi/js'
import React from 'react'
import Button from '../../../../design/components/atoms/Button'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import PropRegisterForm, { PropRegisterFormProps } from './PropRegisterForm'

type PropRegisterModalProps = PropRegisterFormProps & {
  goBack?: () => void
}

const PropRegisterModal = ({
  goBack,
  ...formProps
}: PropRegisterModalProps) => {
  return (
    <MetadataContainer>
      {goBack != null && (
        <MetadataContainerRow
          row={{
            type: 'content',
            content: (
              <Button
                variant='secondary'
                iconPath={mdiArrowLeft}
                onClick={goBack}
                id='prop-register-back'
              >
                Back
              </Button>
            ),
          }}
        />
      )}
      <PropRegisterForm {...formProps} />
    </MetadataContainer>
  )
}

export default PropRegisterModal
