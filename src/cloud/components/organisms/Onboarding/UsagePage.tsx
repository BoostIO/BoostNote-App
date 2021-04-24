import React, { useState } from 'react'
import Page from '../../Page'
import cc from 'classcat'
import styled from '../../../lib/styled'
import ErrorBlock from '../../atoms/ErrorBlock'
import {
  mdiCheckboxBlankCircleOutline,
  mdiCheckCircleOutline,
  mdiChevronRight,
} from '@mdi/js'
import Flexbox from '../../atoms/Flexbox'
import Button from '../../atoms/Button'
import Icon from '../../../../components/atoms/Icon'
import { useRouter } from '../../../lib/router'
import { usingElectron, sendToHost } from '../../../lib/stores/electron'
import Spinner from '../../../../shared/components/atoms/Spinner'

interface UsagePageProps {
  onUsage: (val: 'personal' | 'team') => void
  sending: boolean
  error: unknown
}

const UsagePage = ({ onUsage, sending, error }: UsagePageProps) => {
  const [type, setType] = useState<'personal' | 'team'>('personal')
  const router = useRouter()

  return (
    <Page>
      <Container>
        <div className='settings__wrap'>
          <h1>How are you planning to use Boost Note?</h1>
          <p>We&apos;ll streamline your setup experience accordingly</p>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              onUsage(type)
            }}
          >
            <Flexbox justifyContent='space-between' className='row'>
              <div
                className={cc([
                  'account__type',
                  type === 'personal' && 'active',
                ])}
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
                  size={30}
                />
              </div>
              <div
                className={cc(['account__type', type === 'team' && 'active'])}
                onClick={() => setType('team')}
              >
                <img src='/app/static/images/sozai2.svg' />
                <strong>Cloud space with my team</strong>
                <p>
                  Collaborate smoothly with real-time markdown co-authoring and
                  team optimized features.
                  <br />
                </p>
                <Icon
                  className='account__type__icon'
                  path={
                    type === 'team'
                      ? mdiCheckCircleOutline
                      : mdiCheckboxBlankCircleOutline
                  }
                  size={30}
                />
              </div>
            </Flexbox>
            {error != null && (
              <ErrorBlock error={error} style={{ marginBottom: 32 }} />
            )}
            <Flexbox justifyContent='center' direction='column'>
              <Button type='submit' disabled={sending} variant='primary'>
                {sending ? (
                  <Spinner style={{ position: 'relative', top: 0, left: 0 }} />
                ) : (
                  'Get started for free'
                )}
              </Button>
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
          </form>
        </div>
      </Container>
    </Page>
  )
}

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .local-space {
    text-align: center;
    margin-bottom: 30px;
  }
  .settings__wrap {
    position: relative;
    width: 1020px;
    max-width: 96%;
    margin: 0 auto;
    text-align: center;
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
  h1 {
    color: ${({ theme }) => theme.emphasizedTextColor};
    font-size: ${({ theme }) => theme.fontSizes.xlarge}px;
    margin-top: ${({ theme }) => theme.space.xxxlarge}px;
  }
  form {
    text-align: left;
    margin-top: ${({ theme }) => theme.space.large}px;
    .row {
      margin: ${({ theme }) => theme.space.large}px 0;
      position: relative;
    }
  }
`

export default UsagePage
