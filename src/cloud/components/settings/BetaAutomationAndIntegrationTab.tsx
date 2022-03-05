import React, { FormEvent, useState } from 'react'
import { useCallback } from 'react'
import Button from '../../../design/components/atoms/Button'
import Form from '../../../design/components/molecules/Form'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import { createBetaRequest } from '../../api/beta/request'
import { usePage } from '../../lib/stores/pageStore'

const companySizeOptions = [
  'Just Me',
  '2-10',
  '11-15',
  '51-100',
  '101-1k',
  '1k-10k',
  '10k+',
]

const teamSizeOptions = [
  'Just Me',
  '2-5',
  '6-10',
  '11-25',
  '26-50',
  '51-200',
  '201-500',
  '500+',
]

interface BetaRequestData {
  companySize: string
  companyUrl: string
  teamSize: string
  jobTitle: string
  tools: string
}

const BetaAutomationAndIntegrationTab = () => {
  const { team } = usePage()
  const [data, setData] = useState<BetaRequestData>({
    companySize: companySizeOptions[0],
    companyUrl: '',
    teamSize: teamSizeOptions[0],
    jobTitle: '',
    tools: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle')

  const updateData = useCallback((partialData: Partial<BetaRequestData>) => {
    setData((previousData) => {
      return { ...previousData, ...partialData }
    })
  }, [])

  const submitForm = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (team == null) {
        return
      }

      await createBetaRequest(team.id, 'automation', data)
      setStatus('submitted')
    },
    [data, team]
  )

  if (status === 'submitted') {
    return (
      <SettingTabContent
        title='Automation &amp; Integration'
        body={
          <div>
            <FeatureIntro />
            <p>Thanks for applying beta feature access request.</p>
            <Button
              onClick={() => {
                setStatus('idle')
              }}
            >
              Edit Info
            </Button>
          </div>
        }
      />
    )
  }

  return (
    <SettingTabContent
      title='Automation &amp; Integration'
      body={
        <div>
          <FeatureIntro />
          <Form
            submitButton={{
              label: 'Register Beta Access',
              onClick: submitForm,
            }}
            rows={[
              {
                title: 'Company URL',
                items: [
                  {
                    type: 'input',
                    props: {
                      type: 'text',
                      value: data.companyUrl,
                      onChange: (event) => {
                        updateData({ companyUrl: event.target.value })
                      },
                    },
                  },
                ],
              },
              {
                title: 'Company Size',
                justifyContent: 'flex-start',
                items: companySizeOptions.map((companySizeOption) => {
                  return {
                    type: 'button',
                    props: {
                      label: companySizeOption,
                      variant:
                        data.companySize === companySizeOption
                          ? 'primary'
                          : 'secondary',
                      onClick: () => {
                        updateData({ companySize: companySizeOption })
                      },
                    },
                  }
                }),
              },
              {
                title: 'How many people are you working with?',
                justifyContent: 'flex-start',
                items: teamSizeOptions.map((teamSizeOption) => {
                  return {
                    type: 'button',
                    props: {
                      label: teamSizeOption,
                      variant:
                        data.teamSize === teamSizeOption
                          ? 'primary'
                          : 'secondary',
                      onClick: () => {
                        updateData({ teamSize: teamSizeOption })
                      },
                    },
                  }
                }),
              },
              {
                title: 'Job Title',
                items: [
                  {
                    type: 'input',
                    props: {
                      type: 'text',
                      value: data.jobTitle,
                      onChange: (event) => {
                        updateData({ jobTitle: event.target.value })
                      },
                    },
                  },
                ],
              },
              {
                title: 'What tools are you using with your team?',
                items: [
                  {
                    type: 'input',
                    props: {
                      type: 'text',
                      value: data.tools,
                      onChange: (event) => {
                        updateData({ tools: event.target.value })
                      },
                    },
                  },
                ],
              },
            ]}
          ></Form>
        </div>
      }
    />
  )
}

export default BetaAutomationAndIntegrationTab

const FeatureIntro = () => {
  return (
    <div>
      <p style={{ lineHeight: 1.6 }}>
        Currently, we&apos;re preparing a new feature, Automation / Integration,
        to maximize productivity for users using multiple tools. If you&apos;re
        interested in this feature, please submit the form below. We will reach
        you and provide early access for the beta feature. To learn more, please
        check{' '}
        <a
          href='https://boostnote.io/shared/c5d0ec9b-0cf3-418c-bf1b-0ca39ef4cd52'
          target='_blank'
          rel='noreferrer'
        >
          this article
        </a>
        .
      </p>
    </div>
  )
}
