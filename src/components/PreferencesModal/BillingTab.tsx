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

  return (
    <Section>
      <SectionHeader>Billing</SectionHeader>
      <BillingContent>
        {!loggedIn && (
          <div className='billing-lead'>
            <p>Please sign in to upgrade your plan.</p>
          </div>
        )}
        <SectionTable>
          <thead>
            <th></th>
            <th className='billing-plan'>
              <span className='billing-name'>Basic</span>
              <span className='billing-price'>$0</span>
              {!hasSubscription && (
                <SectionSecondaryButton disabled>
                  Current
                </SectionSecondaryButton>
              )}
            </th>
            <th className='billing-plan'>
              <span className='billing-name'>Premium</span>
              <span className='billing-price'>$3/Month (USD) *</span>
              {!loggedIn && (
                <LoginButton ButtonComponent={SectionPrimaryButton}>
                  Sign In
                </LoginButton>
              )}
              {loggedIn && (
                <a href='/subscription'>
                  <SectionPrimaryButton>
                    {hasSubscription ? 'Manage' : 'Upgrade'}
                  </SectionPrimaryButton>
                </a>
              )}
            </th>
          </thead>
          <tbody>
            <tr>
              <th>Web App</th>
              <td>〇</td>
              <td>〇</td>
            </tr>
            <tr>
              <th>Desktop App (Mac/Windows/Linux)</th>
              <td>〇</td>
              <td>〇</td>
            </tr>
            <tr>
              <th>Mobile App (iOS/Android)</th>
              <td>〇</td>
              <td>〇</td>
            </tr>
            <tr>
              <th>Syncing Multiple Devices</th>
              <td>〇</td>
              <td>〇</td>
            </tr>
            <tr>
              <th>Local Storage Size</th>
              <td>Unlimited</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <th>Cloud Storage Size</th>
              <td>100MB</td>
              <td>2GB</td>
            </tr>
          </tbody>
        </SectionTable>
        {loggedIn && (
          <div className='billing-extra'>
            <p>
              * If you need more cloud storage, you can add it at any time by
              paying $5 (USD) for every 5GB. Click the "Add Extra Storage"
              button below.
            </p>
            <a href='/subscription'>
              <SectionPrimaryButton>Add Extra Storage</SectionPrimaryButton>
            </a>
          </div>
        )}
      </BillingContent>
    </Section>
  )
}

export default BillingTab
