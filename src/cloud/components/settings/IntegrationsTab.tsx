import React, { useCallback } from 'react'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import Button from '../../../design/components/atoms/Button'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import styled from '../../../design/lib/styled'

const IntegrationsTab = () => {
  const { translate } = useI18n()

  const onIntegrationLinkClick = useCallback((target: string) => {
    return trackEvent(MixpanelActionTrackTypes.ZapierLinkOpen, { target })
  }, [])

  return (
    <SettingTabContent
      title={translate(lngKeys.SettingsIntegrations)}
      description={translate(lngKeys.ManageIntegrations)}
      body={
        <>
          <section>
            <StyledServiceList>
              <StyledServiceListItem>
                <div className='item-info zapier'>
                  <img src='/app/static/logos/zapier.png' alt='Zapier' />
                  <p>Connect Boost Note to 3,000+ Apps</p>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('global')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
            </StyledServiceList>
          </section>
          <section>
            <h2>Popular Integrations</h2>
            <StyledServiceList>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/github.png' alt='GitHub' />
                  <div className='item-info-text'>
                    <h3>GitHub</h3>
                    <p>
                      e.g., Submit a pull request and insert a row in your
                      document.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/github'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('github')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/trello.png' alt='Trello' />
                  <div className='item-info-text'>
                    <h3>Trello</h3>
                    <p>
                      e.g., When new Trello card is created, create a new
                      document on Boost Note and attach it.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/trello'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('trello')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/slack.png' alt='Slack' />
                  <div className='item-info-text'>
                    <h3>Slack</h3>
                    <p>
                      e.g., Click emoji reaction on the Slack message and
                      archive it to Boost Note.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/slack'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('slack')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/gmail.png' alt='Gmail' />
                  <div className='item-info-text'>
                    <h3>Gmail</h3>
                    <p>
                      e.g., Star an email on the Gmail and archive it to Boost
                      Hub.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/gmail'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('gmail')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img
                    src='/app/static/logos/google_calendar.png'
                    alt='Google Calendar'
                  />
                  <div className='item-info-text'>
                    <h3>Google Calendar</h3>
                    <p>
                      e.g., Create an event on Google Calendar and create a
                      document on Boost Note automatically.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/google-calendar'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('google-calendar')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img
                    src='/app/static/logos/google_spreadsheet.png'
                    alt='Google Spreadsheet'
                  />
                  <div className='item-info-text'>
                    <h3>Google Sheets</h3>
                    <p>
                      e.g., Create new rows on Google Sheets for new documents
                      on Boost Note.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/google-drive'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('google-drive')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/jira.png' alt='Jira' />
                  <div className='item-info-text'>
                    <h3>Jira</h3>
                    <p>
                      e.g., Add a new issue and create a new document on Boost
                      Hub.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/jira-software'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('jira')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/miro.png' alt='Miro' />
                  <div className='item-info-text'>
                    <h3>Miro</h3>
                    <p>
                      e.g., Create Miro cards and create tagged documents on
                      Boost Hub.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/miro'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('miro')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/dropbox.png' alt='Dropbox' />
                  <div className='item-info-text'>
                    <h3>Dropbox</h3>
                    <p>
                      e.g., Upload a new text file on Dropbox and create a new
                      document on Boost Note.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/dropbox'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('dropbox')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/airtable.png' alt='Airtable' />
                  <div className='item-info-text'>
                    <h3>Airtable</h3>
                    <p>
                      e.g., Create Airtable records and add new tagged notes in
                      Boost Note.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/airtable'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('airtable')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/clickup.png' alt='Clickup' />
                  <div className='item-info-text'>
                    <h3>ClickUp</h3>
                    <p>
                      e.g., Create ClickUp tasks and insert the task to your
                      document.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/clickup'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('clickup')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img
                    src='/app/static/logos/aws.png'
                    alt='Amazon Web Service'
                  />
                  <div className='item-info-text'>
                    <h3>Amazon Web Service</h3>
                    <p>
                      e.g., Added new functions on AWS, and append content to an
                      existing note by title inside Boost Note (it will be
                      created first if it does not exist.)
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/aws-lambda'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('lambda')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/mailchimp.png' alt='Mailchimp' />
                  <div className='item-info-text'>
                    <h3>Mailchimp</h3>
                    <p>
                      e.g., Add New Mailchimp Subscribers to a document on Boost
                      Hub.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/mailchimp'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('mailchimp')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/intercom.png' alt='Intercom' />
                  <div className='item-info-text'>
                    <h3>Intercom</h3>
                    <p>
                      e.g., A new conversation is created and create a document
                      on Boost Note.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/intercom'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('intercom')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/stripe.jpeg' alt='Stripe' />
                  <div className='item-info-text'>
                    <h3>Stripe</h3>
                    <p>
                      e.g., A new event like a dispute, subscription, or
                      transfer is added, and append to a document on Boost Note
                      for Teams.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/stripe'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('stripe')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/asana.png' alt='Asana' />
                  <div className='item-info-text'>
                    <h3>Asana</h3>
                    <p>e.g., Create documents from new Asana tasks.</p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/asana'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('asana')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info zapier'>
                  <img src='/app/static/logos/zapier.png' alt='Zapier' />
                  <p>Connect Boost Note to 3,000+ Apps</p>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <Button
                    variant='secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('zapier')}
                  >
                    {translate(lngKeys.GeneralSeeVerb)}
                  </Button>
                </a>
              </StyledServiceListItem>
            </StyledServiceList>
          </section>
        </>
      }
    ></SettingTabContent>
  )
}

const StyledServiceList = styled.ul`
  background-color: ${({ theme }) => theme.colors.background.primary};
  padding-left: 0;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  list-style: none;
`

const StyledServiceListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.sizes.spaces.sm}px;

  + li {
    border-top: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  p {
    margin-bottom: 0;
  }

  .item-info {
    display: flex;
    &.zapier {
      align-items: center;
    }

    img {
      height: 30px;
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    p {
      margin-top: 0;
    }
  }

  .item-info-text {
    padding-right: ${({ theme }) => theme.sizes.spaces.df}px;

    h3 {
      margin-top: 0;
      margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
      font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    }
    p {
      color: ${({ theme }) => theme.colors.text.subtle};
      font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    }
    small {
      color: ${({ theme }) => theme.colors.text.subtle};
      a {
        color: ${({ theme }) => theme.colors.text.link};
        text-decoration: underline;

        &:hover,
        &:focus {
          text-decoration: none;
        }
      }
    }
  }
`

export default IntegrationsTab
