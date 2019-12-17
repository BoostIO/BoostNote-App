import React from 'react'
import {
  Section,
  SectionHeader,
  SectionPrimaryButton,
  SectionSecondaryButton,
  SectionTable
} from './styled'
import styled from '../../lib/styled'

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
  return (
    <Section>
      <SectionHeader>Billing</SectionHeader>
      <BillingContent>
        <div className='billing-lead'>
          <p>Please sign in to upgrade your plan.</p>
          <SectionPrimaryButton>Sign In</SectionPrimaryButton>
        </div>
        <SectionTable>
          <thead>
            <th></th>
            <th className='billing-plan'>
              <span className='billing-name'>Basic</span>
              <span className='billing-price'>$0</span>
              <SectionSecondaryButton disabled>Current</SectionSecondaryButton>
            </th>
            <th className='billing-plan'>
              <span className='billing-name'>Premium</span>
              <span className='billing-price'>$3/Month (USD) *</span>
              <SectionPrimaryButton disabled>Upgrade</SectionPrimaryButton>
              <SectionPrimaryButton>Upgrade</SectionPrimaryButton>
              <SectionSecondaryButton>Cancel</SectionSecondaryButton>
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
        <div className='billing-extra'>
          <p>
            * If you need more cloud storage, you can add it at any time by
            paying $5 (USD) for every 5GB. Click the "Add Extra Storage" button
            below.
          </p>
          <SectionPrimaryButton>Add Extra Storage</SectionPrimaryButton>
        </div>
      </BillingContent>
    </Section>
  )
}

export default BillingTab
