import React, { useState, useCallback } from 'react'
import { SectionIntroduction } from '../settings/styled'
import { SerializedSubscription } from '../../interfaces/db/subscription'
import { redeemPromo } from '../../api/teams/subscription'
import { useToast } from '../../../design/lib/stores/toast'
import Button, { LoadingButton } from '../../../design/components/atoms/Button'
import ButtonGroup from '../../../design/components/atoms/ButtonGroup'
import Form from '../../../design/components/molecules/Form'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import styled from '../../../design/lib/styled'
import Banner from '../../../design/components/atoms/Banner'
import { mdiGiftOff } from '@mdi/js'
import { lngKeys } from '../../lib/i18n/types'
import { useI18n } from '../../lib/hooks/useI18n'

interface UpdateBillingPromoFormProps {
  sub?: SerializedSubscription
  onSuccess: (subscription: SerializedSubscription) => void
  onCancel: () => void
}

const UpdateBillingPromoForm = ({
  sub,
  onSuccess,
  onCancel,
}: UpdateBillingPromoFormProps) => {
  const { pushApiErrorMessage, pushMessage } = useToast()
  const [sending, setSending] = useState<boolean>(false)
  const [promoCode, setPromoCode] = useState<string>('')
  const { translate } = useI18n()

  const onSubmit = async (event: any) => {
    event.preventDefault()
    if (sub == null || sub.status === 'canceled') {
      return
    }

    try {
      setSending(true)
      const { subscription } = await redeemPromo(sub.teamId, {
        code: promoCode,
      })
      pushMessage({
        title: 'Promo Code',
        description: `Applied promo code '${promoCode}' to your subscription`,
        type: 'success',
      })
      onSuccess(subscription)
    } catch (error) {
      if (error.response.status === 403) {
        pushMessage({
          type: 'error',
          title: 'Error',
          description: `Promo code ${promoCode} is not available for this account`,
        })
      } else {
        pushApiErrorMessage(error)
      }
    } finally {
      setSending(false)
      setPromoCode('')
    }
  }

  const onPromoInputChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPromoCode(event.target.value)
    },
    [setPromoCode]
  )

  if (sub == null) {
    return (
      <div>
        <SectionIntroduction>
          <p>You need to have a valid subscription to perform this action.</p>
          <Button onClick={onCancel} variant='secondary' disabled={sending}>
            Cancel
          </Button>
        </SectionIntroduction>
      </div>
    )
  }

  return (
    <Container>
      {sub.couponId != null && (
        <Banner variant='warning' iconPath={mdiGiftOff}>
          {translate(lngKeys.BillingApplyPromoWarning)}
        </Banner>
      )}
      <p>{translate(lngKeys.BillingApplyPromo)}</p>
      <Form onSubmit={onSubmit} rows={[]}>
        <FormRow
          row={{
            items: [
              {
                type: 'input',
                props: {
                  placeholder: translate(lngKeys.PromoCode),
                  value: promoCode,
                  onChange: onPromoInputChangeHandler,
                },
              },
            ],
          }}
        />

        <ButtonGroup display='flex' layout='spread' className='button__group'>
          <Button onClick={onCancel} variant='secondary' disabled={sending}>
            {translate(lngKeys.GeneralCancel)}
          </Button>

          <LoadingButton
            onClick={onSubmit}
            variant='primary'
            disabled={sending}
            spinning={sending}
          >
            {translate(lngKeys.GeneralApplyVerb)}
          </LoadingButton>
        </ButtonGroup>
      </Form>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;

  .button__group {
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;
  }
`

export default UpdateBillingPromoForm
