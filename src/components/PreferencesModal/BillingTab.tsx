import React, { useState, useEffect } from 'react'
import {
  Section,
  SectionHeader,
  SectionPrimaryButton,
  SectionSecondaryButton,
  SectionTable
} from './styled'
import styled from '../../lib/styled'
import { usePreferences } from '../../lib/preferences'
import { getSubscription, Subscription } from '../../lib/accounts'
import LoginButton from '../atoms/LoginButton'
import { openNew } from '../../lib/utils/platform'
import { useTranslation } from 'react-i18next'

const BillingContent = styled.div`
  .billing-lead {
    margin-bottom: 24px;

    p,
    button {
      display: inline-block;
    }
    button {
      margin-left: 24px;
    }
  }

  .billing-plan {
    vertical-align: top;
    text-align: center;
  }

  .billing-name {
    margin-bottom: 8px;
  }

  .billing-price {
    margin-bottom: 24px;
    font-size: 16px;
    font-weight: 400;
  }

  .billing-extra {
    margin-top: 24px;
    max-width: 600px;
    font-style: italic;
    line-height: 1.8;
  }
`

const BillingTab = () => {
  const { preferences } = usePreferences()
  const user = preferences['general.accounts'][0]
  const [subscription, setSubscription] = useState<Subscription | undefined>(
    undefined
  )

  useEffect(() => {
    if (user != null) {
      getSubscription(user).then(subscription => {
        setSubscription(subscription)
      })
    }
  }, [user])

  const loggedIn = user != null
  const hasSubscription = subscription != null

  const { t } = useTranslation()

  return (
    <Section>
      <SectionHeader>{t('billing.billing')}</SectionHeader>
      <BillingContent>
        {!loggedIn && (
          <div className='billing-lead'>
            <p>{t('billing.message')}</p>
          </div>
        )}
        <SectionTable>
          <thead>
            <th></th>
            <th className='billing-plan'>
              <span className='billing-name'>{t('billing.basic')}</span>
              <span className='billing-price'>$0</span>
              {!hasSubscription && (
                <SectionSecondaryButton disabled>
                  {t('billing.current')}
                </SectionSecondaryButton>
              )}
            </th>
            <th className='billing-plan'>
              <span className='billing-name'>{t('billing.premium')}</span>
              <span className='billing-price'>{t('billing.price')}</span>
              {!loggedIn && (
                <LoginButton ButtonComponent={SectionPrimaryButton}>
                  {t('general.signin')}
                </LoginButton>
              )}
              {loggedIn && (
                <SectionPrimaryButton
                  onClick={() =>
                    openNew('https://note.boostio.co/subscription')
                  }
                >
                  {hasSubscription ? 'Manage' : 'Upgrade'}
                </SectionPrimaryButton>
              )}
            </th>
          </thead>
          <tbody>
            <tr>
              <th>{t('billing.browser')}</th>
              <td>〇</td>
              <td>〇</td>
            </tr>
            <tr>
              <th>{t('billing.desktop')}</th>
              <td>〇</td>
              <td>〇</td>
            </tr>
            <tr>
              <th>{t('billing.mobile')}</th>
              <td>〇</td>
              <td>〇</td>
            </tr>
            <tr>
              <th>{t('billing.sync')}</th>
              <td>〇</td>
              <td>〇</td>
            </tr>
            <tr>
              <th>{t('billing.local')}</th>
              <td>〇</td>
              <td>〇</td>
            </tr>
            <tr>
              <th>{t('billing.cloud')}</th>
              <td>〇</td>
              <td>〇</td>
            </tr>
            <tr>
              <th>{t('billing.storageSize')}</th>
              <td>100MB</td>
              <td>2GB</td>
            </tr>
          </tbody>
        </SectionTable>
        {loggedIn && (
          <div className='billing-extra'>
            <p>{t('billing.addStorageDescription')}</p>
            <SectionPrimaryButton
              onClick={() => openNew('https://note.boostio.co/subscription')}
            >
              {t('billing.addStorage')}
            </SectionPrimaryButton>
          </div>
        )}
      </BillingContent>
    </Section>
  )
}

export default BillingTab
