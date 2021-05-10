import React, { useCallback, useMemo, useState } from 'react'
import styled from '../../../lib/styled'
import Spinner from '../../atoms/CustomSpinner'
import { useApiTokens, withApiTokens } from '../../../lib/stores/apiTokens'
import TokenControl from '../../molecules/TokenControl'
import { usePage } from '../../../lib/stores/pageStore'
import Icon from '../../atoms/IconMdi'
import { mdiOpenInNew } from '@mdi/js'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'
import SettingLink from '../../../../shared/components/organisms/Settings/atoms/SettingLink'
import Button from '../../../../shared/components/atoms/Button'
import SettingTokenCreate from '../../../../shared/components/organisms/Settings/molecules/SettingTokenCreate'
import Flexbox from '../../../../shared/components/atoms/Flexbox'

const ApiTab = () => {
  const { team } = usePage()
  const apiTokenState = useApiTokens()
  const [tokenCreateMode, setTokenCreateMode] = useState(false)

  const createToken = useCallback(
    (name: string) => {
      if (apiTokenState.state !== 'initialising' && team != null) {
        apiTokenState.actions.createToken(name, team)
        setTokenCreateMode(false)
      }
    },
    [apiTokenState, team]
  )

  const tokens = useMemo(() => {
    return apiTokenState.state === 'initialised' && team != null
      ? apiTokenState.tokens.filter((token) => token.teamId === team.id)
      : []
  }, [apiTokenState, team])

  return (
    <SettingTabContent
      title='API'
      description='These tokens are available only to BoostIO.'
      body={
        <>
          <section>
            <p className='text--subtle'>
              These tokens are available only to{' '}
              {team != null ? team.name : 'your team'}.
            </p>
          </section>
          <section>
            <Flexbox justifyContent='space-between' alignItems='start'>
              <div>
                <h2 style={{ margin: '0' }}>Access Tokens</h2>
                <p>
                  See the{' '}
                  <SettingLink
                    href='https://intercom.help/boostnote-for-teams/en/articles/4590937-public-api-documentation'
                    target='_blank'
                  >
                    documentation for Boost Note for Teams API{' '}
                    <Icon path={mdiOpenInNew} />
                  </SettingLink>
                </p>
              </div>
              <Button
                onClick={() => setTokenCreateMode(!tokenCreateMode)}
                disabled={apiTokenState.state === 'initialising'}
              >
                {tokenCreateMode ? 'Close' : 'Generate Token'}
              </Button>
            </Flexbox>
            {tokenCreateMode && (
              <StyledServiceList>
                <StyledServiceListItem>
                  <SettingTokenCreate onCreate={createToken} />
                </StyledServiceListItem>
              </StyledServiceList>
            )}
            {apiTokenState.state === 'initialising' && (
              <Flexbox justifyContent='center'>
                <Spinner />
              </Flexbox>
            )}
            {apiTokenState.state === 'initialised' && tokens.length > 0 && (
              <StyledServiceList>
                {tokens.map((token) => {
                  return (
                    <StyledServiceListItem key={token.id}>
                      <TokenControl
                        token={token}
                        onDelete={apiTokenState.actions.deleteToken}
                        onUpdate={apiTokenState.actions.updateToken}
                      />
                    </StyledServiceListItem>
                  )
                })}
              </StyledServiceList>
            )}
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
  }

  .item-info-text {
    padding-right: ${({ theme }) => theme.space.default}px;

    h3 {
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
        text-decoration: underline;
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

export default withApiTokens(ApiTab)
