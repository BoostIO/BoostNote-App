import React, { useState } from 'react'
import cc from 'classcat'
import styled from '../../../lib/styled'
import {
  mdiCheckboxBlankCircleOutline,
  mdiCheckCircleOutline,
  mdiChevronRight,
} from '@mdi/js'
import { useRouter } from '../../../lib/router'
import { usingElectron, sendToHost } from '../../../lib/stores/electron'
import Button, {
  LoadingButton,
} from '../../../../shared/components/atoms/Button'
import Flexbox from '../../../../shared/components/atoms/Flexbox'
import OnboardingLayout from './layouts/OnboardingLayout'
import Icon from '../../../../shared/components/atoms/Icon'

interface UsagePageProps {
  onUsage: (val: 'personal' | 'team') => void
  sending: boolean
}

const UsagePage = ({ onUsage, sending }: UsagePageProps) => {
  const [type, setType] = useState<'personal' | 'team'>('personal')
  const router = useRouter()

  return (
    <OnboardingLayout
      title='How are you planning to use Boost Note?'
      subtitle="We'll streamline your setup experience accordingly"
      contentWidth={1020}
    >
      <Container
        onSubmit={(event: any) => {
          event.preventDefault()
          onUsage(type)
        }}
      >
        <Flexbox justifyContent='space-between' className='row'>
          <div
            className={cc(['account__type', type === 'personal' && 'active'])}
            onClick={() => setType('personal')}
          >
            <img src='/app/static/images/sozai1.svg' />
            <strong>Cloud space for myself</strong>
            <p>
              Write fast, think deeply. Organize Your personal wiki with
              powerful features.
            </p>
            <Icon
              className='account__type__icon'
              path={
                type === 'personal'
                  ? mdiCheckCircleOutline
                  : mdiCheckboxBlankCircleOutline
              }
              size={34}
            />
          </div>
          <div
            className={cc(['account__type', type === 'team' && 'active'])}
            onClick={() => setType('team')}
          >
            <img src='/app/static/images/sozai2.svg' />
            <strong>Cloud space with my team</strong>
            <p>
              Collaborate smoothly with real-time markdown co-authoring and team
              optimized features.
              <br />
            </p>
            <Icon
              className='account__type__icon'
              path={
                type === 'team'
                  ? mdiCheckCircleOutline
                  : mdiCheckboxBlankCircleOutline
              }
              size={34}
            />
          </div>
        </Flexbox>
        <Flexbox justifyContent='center' direction='column'>
          <LoadingButton
            type='submit'
            disabled={sending}
            variant='bordered'
            spinning={sending}
            size='lg'
            className='submit__button'
          >
            Get started for free
          </LoadingButton>
          {!usingElectron && router.goBack != null && (
            <Button
              type='button'
              disabled={sending}
              variant='transparent'
              onClick={() => router.goBack!()}
            >
              <Flexbox alignItems='center'>
                <Icon path={mdiChevronRight} />
                <span>Go Back</span>
              </Flexbox>
            </Button>
          )}
          {usingElectron && (
            <Button
              type='button'
              variant='transparent'
              onClick={() => {
                sendToHost('create-local-space')
              }}
            >
              <Flexbox alignItems='center'>Create a local space</Flexbox>
            </Button>
          )}
        </Flexbox>
      </Container>
    </OnboardingLayout>
  )
}

const Container = styled.form`
  text-align: left;
  margin-top: ${({ theme }) => theme.space.large}px;
  .row {
    margin: ${({ theme }) => theme.space.large}px 0;
    position: relative;
  }

  .submit__button {
    width: 300px;
  }

  .local-space {
    text-align: center;
    margin-bottom: 30px;
  }
  .account__type__icon {
    position: absolute;
    right: 5px;
    top: 5px;
  }
  .account__type {
    &:not(.active) {
      .account__type__icon {
        color: ${({ theme }) => theme.baseIconColor};
      }
      opacity: 0.6;
    }
    &.active {
      .account__type__icon {
        color: ${({ theme }) => theme.primaryTextColor};
      }
      border-color: ${({ theme }) => theme.primaryBorderColor};
    }
    position: relative;
    cursor: pointer;
    border: 3px solid ${({ theme }) => theme.blackBackgroundColor};
    border-radius: 3px;
    min-height: 100%;
    width: 48%;
    text-align: center;
    margin: 0 ${({ theme }) => theme.space.small}px;
    padding: ${({ theme }) => theme.space.small}px
      ${({ theme }) => theme.space.medium}px;
    display: block;
    background-color: ${({ theme }) => theme.whiteBackgroundColor};
    color: ${({ theme }) => theme.blackBackgroundColor} !important;
    img {
      margin: ${({ theme }) => theme.space.small}px auto;
      display: block;
      width: 60%;
      height: 200px;
    }
    strong {
      display: block;
      font-size: ${({ theme }) => theme.fontSizes.large}px;
      margin-bottom: ${({ theme }) => theme.space.small}px;
    }
  }
`

export default UsagePage
