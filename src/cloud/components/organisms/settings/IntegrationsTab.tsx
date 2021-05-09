import React, { useCallback, useMemo } from 'react'
import styled from '../../../lib/styled'
import { SectionSubtleText, SectionHeader2 } from './styled'
import CustomButton from '../../atoms/buttons/CustomButton'
import ServiceConnect from '../../atoms/ServiceConnect'
import Spinner from '../../atoms/CustomSpinner'
import {
  useServiceConnections,
  withServiceConnections,
} from '../../../lib/stores/serviceConnections'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'
import FeedbackModal from '../Modal/contents/FeedbackModal'
import { githubOauthId, boostHubBaseUrl } from '../../../lib/consts'
import { usingElectron } from '../../../lib/stores/electron'
import Button from '../../atoms/Button'
import { openNew } from '../../../lib/utils/platform'
import { usePage } from '../../../lib/stores/pageStore'
import { useModal } from '../../../../shared/lib/stores/modal'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'

const IntegrationsTab = () => {
  const { openModal } = useModal()
  const connectionState = useServiceConnections()
  const { team } = usePage()

  const githubConnection = useMemo(() => {
    return connectionState.type !== 'initialising'
      ? connectionState.connections.find((conn) => conn.service === 'github')
      : null
  }, [connectionState])

  const removeGithubConnection = useCallback(() => {
    if (connectionState.type !== 'initialising' && githubConnection != null) {
      connectionState.actions.removeConnection(githubConnection)
    }
  }, [githubConnection, connectionState])

  const onIntegrationLinkClick = useCallback((target: string) => {
    return trackEvent(MixpanelActionTrackTypes.ZapierLinkOpen, { target })
  }, [])

  return (
    <SettingTabContent
      title={'Integrations'}
      body={
        <>
          <section>
            <SectionSubtleText>
              Connect 3rd party content to your Boost Note for Teams documents.
            </SectionSubtleText>
            <StyledServiceList>
              <StyledServiceListItem>
                <div className='item-info zapier'>
                  <img src='/app/static/logos/zapier.png' alt='Zapier' />
                  <p>Connect Boost Note for Teams to 2,000+ Apps</p>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('global')}
                  >
                    See
                  </CustomButton>
                </a>
              </StyledServiceListItem>
            </StyledServiceList>
          </section>
          <section>
            <SectionHeader2>Popular Integrations</SectionHeader2>
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
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('github')}
                  >
                    See
                  </CustomButton>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/trello.png' alt='Trello' />
                  <div className='item-info-text'>
                    <h3>Trello</h3>
                    <p>
                      e.g., When new Trello card is created, create a new
                      document on Boost Note for Teams and attach it.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/trello'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('trello')}
                  >
                    See
                  </CustomButton>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/slack.png' alt='Slack' />
                  <div className='item-info-text'>
                    <h3>Slack</h3>
                    <p>
                      e.g., Click emoji reaction on the Slack message and
                      archive it to Boost Note for Teams.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/slack'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('slack')}
                  >
                    See
                  </CustomButton>
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
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('gmail')}
                  >
                    See
                  </CustomButton>
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
                      document on Boost Note for Teams automatically.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/google-calendar'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('google-calendar')}
                  >
                    See
                  </CustomButton>
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
                      on Boost Note for Teams.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/google-drive'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('google-drive')}
                  >
                    See
                  </CustomButton>
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
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('jira')}
                  >
                    See
                  </CustomButton>
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
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('miro')}
                  >
                    See
                  </CustomButton>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/dropbox.png' alt='Dropbox' />
                  <div className='item-info-text'>
                    <h3>Dropbox</h3>
                    <p>
                      e.g., Upload a new text file on Dropbox and create a new
                      document on Boost Note for Teams.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/dropbox'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('dropbox')}
                  >
                    See
                  </CustomButton>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/airtable.png' alt='Airtable' />
                  <div className='item-info-text'>
                    <h3>Airtable</h3>
                    <p>
                      e.g., Create Airtable records and add new tagged notes in
                      Boost Note for Teams.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/airtable'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('airtable')}
                  >
                    See
                  </CustomButton>
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
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('clickup')}
                  >
                    See
                  </CustomButton>
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
                      existing note by title inside Boost Note for Teams (it
                      will be created first if it does not exist.)
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/aws-lambda'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('lambda')}
                  >
                    See
                  </CustomButton>
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
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('mailchimp')}
                  >
                    See
                  </CustomButton>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/intercom.png' alt='Intercom' />
                  <div className='item-info-text'>
                    <h3>Intercom</h3>
                    <p>
                      e.g., A new conversation is created and create a document
                      on Boost Note for Teams.
                    </p>
                  </div>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations/intercom'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('intercom')}
                  >
                    See
                  </CustomButton>
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
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('stripe')}
                  >
                    See
                  </CustomButton>
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
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('asana')}
                  >
                    See
                  </CustomButton>
                </a>
              </StyledServiceListItem>
              <StyledServiceListItem>
                <div className='item-info zapier'>
                  <img src='/app/static/logos/zapier.png' alt='Zapier' />
                  <p>Connect Boost Note for Teams to 2,000+ Apps</p>
                </div>
                <a
                  href='https://zapier.com/apps/boost-hub/integrations'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                    onClick={() => onIntegrationLinkClick('zapier')}
                  >
                    See
                  </CustomButton>
                </a>
              </StyledServiceListItem>
            </StyledServiceList>
          </section>
          <section>
            <SectionHeader2>External Entity</SectionHeader2>
            <StyledServiceList>
              <StyledServiceListItem>
                <div className='item-info'>
                  <img src='/app/static/logos/github.png' alt='GitHub' />
                  <div className='item-info-text'>
                    <h3>GitHub</h3>
                    <p>
                      You can embed the Private GitHub issues and pull requests.
                    </p>
                    <small>
                      Manage access via GitHub{' '}
                      <a
                        target='_blank'
                        rel='noreferrer noopener'
                        href={`https://github.com/settings/connections/applications/${githubOauthId}`}
                      >
                        here
                      </a>
                    </small>
                  </div>
                </div>
                {(connectionState.type === 'initialising' ||
                  connectionState.type === 'working') && (
                  <CustomButton
                    variant='inverse-secondary'
                    className='item-btn'
                  >
                    <Spinner />
                  </CustomButton>
                )}
                {connectionState.type === 'initialised' && (
                  <>
                    {githubConnection == null ? (
                      usingElectron ? (
                        <Button
                          variant='secondary'
                          onClick={() => {
                            openNew(`${boostHubBaseUrl}/${team?.domain}`)
                          }}
                        >
                          Open in Browser to enable GitHub app
                        </Button>
                      ) : (
                        <ServiceConnect
                          variant='inverse-secondary'
                          className='item-btn'
                          service='github'
                          onConnect={connectionState.actions.addConnection}
                        >
                          Enable
                        </ServiceConnect>
                      )
                    ) : (
                      <CustomButton
                        variant='danger'
                        className='item-btn'
                        onClick={removeGithubConnection}
                      >
                        Disable
                      </CustomButton>
                    )}
                  </>
                )}
              </StyledServiceListItem>
              <StyledServiceListItem>
                <p>
                  Boost Note for Teams will show you the external content such
                  as Github issues, Trello cards, Google Docs, and much more
                  automatically. What do you want on Boost Note for Teams?
                  <button
                    className='item-info-request'
                    onClick={() =>
                      openModal(<FeedbackModal />, { width: 'large' })
                    }
                  >
                    Please let us know your requests!
                  </button>
                </p>
              </StyledServiceListItem>
            </StyledServiceList>
          </section>
        </>
      }
    ></SettingTabContent>
  )
}

const StyledServiceList = styled.ul`
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  padding-left: 0;
  border: 1px solid ${({ theme }) => theme.baseBorderColor};
  list-style: none;
`

const StyledServiceListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.space.small}px;

  + li {
    border-top: 1px solid ${({ theme }) => theme.baseBorderColor};
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
      margin-right: ${({ theme }) => theme.space.small}px;
    }

    p {
      margin-top: 0;
    }
  }

  .item-info-text {
    padding-right: ${({ theme }) => theme.space.default}px;

    h3 {
      margin-top: 0;
      margin-bottom: ${({ theme }) => theme.space.xxsmall}px;
      font-size: ${({ theme }) => theme.fontSizes.default}px;
    }
    p {
      color: ${({ theme }) => theme.subtleTextColor};
      font-size: ${({ theme }) => theme.fontSizes.small}px;
    }
    small {
      color: ${({ theme }) => theme.subtleTextColor};
      a {
        color: ${({ theme }) => theme.primaryTextColor};
        text-decoration: underline;

        &:hover,
        &:focus {
          text-decoration: none;
        }
      }
    }
  }

  .item-info-request {
    background: none;
    border: none;
    color: ${({ theme }) => theme.primaryTextColor};

    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }
`

export default withServiceConnections(IntegrationsTab)
