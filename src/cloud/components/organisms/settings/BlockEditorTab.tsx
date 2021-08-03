import React from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'
import { useSettings } from '../../../lib/stores/settings'
import Button, {
  LoadingButton,
} from '../../../../shared/components/atoms/Button'
import Flexbox from '../../../../shared/components/atoms/Flexbox'
import {
  useBetaRegistration,
  withBetaRegistration,
} from '../../../lib/stores/betaRegistration'
import Form from '../../../../shared/components/molecules/Form'
import styled from '../../../../shared/lib/styled'

const BlockEditorTab = () => {
  const { team } = usePage()
  const { openSettingsTab } = useSettings()
  const betaRegistration = useBetaRegistration()

  return (
    <SettingTabContent
      title='Block Editor'
      description={`Some information about our upcoming feature!`}
      body={
        <Container>
          <p>Hello everyone and thank you for your continued interest.</p>
          <p>
            As of late, we have been releasing features to help the
            organisational structuring of your documents, things such as{' '}
            <strong>Document properties</strong>, <strong>Smart Folders</strong>
            . We would like to thank you again for your support and feedback you
            have sent us directly in places such as the
            <Button
              variant='transparent'
              size='sm'
              onClick={() => openSettingsTab('feedback')}
              tabIndex={-1}
            >
              Feedback Form
            </Button>{' '}
            or social media.
          </p>
          <p>
            In the upcoming months, we will be releasing a new feature in closed
            beta, the <strong>Block Editor</strong>, which is pushing even
            further in the same direction.
          </p>
          <p>
            In our day to day workflow, we have always been using multiple third
            party services for organizing our tasks and schedules, and sometimes
            it can be challlenging to keep track of the whole landscape or even
            to customize the information output as we would prefer. We, and many
            others, have felt a lack there and so the idea behind the{' '}
            <strong>Block Editor</strong> came to be.
          </p>
          <br />
          <img src='/static/images/blockeditor_1.png' />
          <Flexbox justifyContent='center'>
            <small>
              <i>Block Editor concept mockup</i>
            </small>
          </Flexbox>
          <br />
          <p>
            We are striving to make it so that in a few simple clicks, you can
            manage to customize BoostNote or third party information coming from
            your registered integrations into an organized document view that
            fits your workflow the best while the information is kept up to date
            in the background. In this way you will be able to decide of your
            own organisational rules while easily keeping track of your entire
            workflow from within BoostNote.
          </p>
          <br />
          <img src='/static/images/blockeditor_2.png' />
          <Flexbox justifyContent='center'>
            <small>
              <i>Each block can be maximized to have to clearer view</i>
            </small>
          </Flexbox>
          <br />
          <p>
            As written above, we will be first releasing it in a closed beta
            state for a few months while we keep polishing and improving it
            based on teams&apos; feedbacks. If you wish to participate in the
            closed beta launch and provide us with direct feedback, please
            register to the queue via the button below.
          </p>
          <Form
            className='registration__form'
            onSubmit={() => {
              if (betaRegistration.state === 'loading') {
                return
              }

              return betaRegistration.registration.register(
                team != null ? team.id : undefined
              )
            }}
          >
            <Flexbox justifyContent='center'>
              {betaRegistration.state === 'loading' ? (
                <LoadingButton type='submit' disabled={true}>
                  ...
                </LoadingButton>
              ) : (
                <LoadingButton
                  type='submit'
                  variant='primary'
                  disabled={
                    betaRegistration.betaRegistration != null ||
                    betaRegistration.registration.registering
                  }
                  spinning={betaRegistration.registration.registering}
                >
                  {betaRegistration.betaRegistration != null
                    ? 'Registered'
                    : 'Register'}
                </LoadingButton>
              )}
            </Flexbox>
          </Form>
          <p>Thank you,</p>
          <p>The BoostIO team.</p>
        </Container>
      }
    ></SettingTabContent>
  )
}

const Container = styled.div`
  .registration__form {
    margin: ${({ theme }) => theme.sizes.spaces.l}px 0 !important;
  }
`

export default withBetaRegistration(BlockEditorTab)
