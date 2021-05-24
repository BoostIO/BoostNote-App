import React, { useMemo } from 'react'
import cc from 'classcat'
import styled from '../../../../lib/styled'
import {
  formInputHeight,
  selectV2Theme,
} from '../../../../lib/styled/styleFunctions'

import Stripe, { StripeElementStyle } from '@stripe/stripe-js'
import { CardElement } from '@stripe/react-stripe-js'
import { ThemeTypes } from '../../../../lib/styled/types'

export interface FormStripeInputProps {
  id?: string
  className?: string
  theme: ThemeTypes
  onChange: (event: Stripe.StripeCardElementChangeEvent) => void
}

const FormStripeInput = ({
  className,
  id,
  onChange,
  theme,
}: FormStripeInputProps) => {
  const stripeFormStyle: StripeElementStyle = useMemo(() => {
    const themeProps = selectV2Theme(theme)
    return {
      base: {
        fontFamily: themeProps.fonts.family,
        fontSize: `${themeProps.sizes.fonts.df}px`,
        color: themeProps.colors.text.primary,
        '::placeholder': {
          color: themeProps.colors.text.subtle,
        },
        ':focus': {},
      },
    }
  }, [theme])

  return (
    <Container>
      <CardElement
        className={cc(['form__input', className])}
        options={{
          style: stripeFormStyle,
        }}
        id={id}
        onChange={onChange}
      />
    </Container>
  )
}

export default FormStripeInput

const Container = styled.div`
  flex: 1 1 auto;
  padding: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
  border-radius: ${({ theme }) => theme.borders.radius}px;
  ${formInputHeight}
  border: 1px solid ${({ theme }) => theme.colors.border.main};

  .StripeElement {
    line-height: 32px !important;
    height: 100%;
    margin: 0 !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
  }
`
