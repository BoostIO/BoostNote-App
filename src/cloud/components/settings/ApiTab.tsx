import React, { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { useApiTokens, withApiTokens } from '../../lib/stores/apiTokens'
import TokenControl from '../TokenControl'
import { usePage } from '../../lib/stores/pageStore'
import { mdiOpenInNew } from '@mdi/js'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import Button from '../../../design/components/atoms/Button'
import Flexbox from '../../../design/components/atoms/Flexbox'
import { ExternalLink } from '../../../design/components/atoms/Link'
import Form from '../../../design/components/molecules/Form'
import ViewerRestrictedWrapper from '../ViewerRestrictedWrapper'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { TFunction } from 'i18next'
import Spinner from '../../../design/components/atoms/Spinner'
import styled from '../../../design/lib/styled'
import Icon from '../../../design/components/atoms/Icon'

const ApiTab = () => {
  const { team } = usePage()
  const apiTokenState = useApiTokens()
  const [tokenCreateMode, setTokenCreateMode] = useState(false)
  const { translate } = useI18n()

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
      description={translate(lngKeys.ManageApi, {
        space: team != null ? team.name : translate(lngKeys.GeneralThisSpace),
      })}
      body={
        <ViewerRestrictedWrapper>
          <section>
            <Flexbox justifyContent='space-between' alignItems='start'>
              <div>
                <h2 style={{ margin: '0' }}>
                  {translate(lngKeys.AccessTokens)}
                </h2>
                <p>
                  {translate(lngKeys.GeneralSeeVerb)}:{' '}
                  <ExternalLink href='https://intercom.help/boostnote-for-teams/en/articles/4590937-public-api-documentation'>
                    {translate(lngKeys.TokensDocumentation)}{' '}
                    <Icon path={mdiOpenInNew} />
                  </ExternalLink>
                </p>
              </div>
              <Button
                onClick={() => setTokenCreateMode(!tokenCreateMode)}
                disabled={apiTokenState.state === 'initialising'}
              >
                {tokenCreateMode
                  ? translate(lngKeys.GeneralCloseVerb)
                  : translate(lngKeys.GenerateToken)}
              </Button>
            </Flexbox>
            {tokenCreateMode && (
              <StyledServiceList>
                <StyledServiceListItem>
                  <SettingTokenCreate onCreate={createToken} t={translate} />
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
        </ViewerRestrictedWrapper>
      }
    ></SettingTabContent>
  )
}

const SettingTokenCreate = ({
  onCreate,
  t,
}: {
  onCreate: (val: string) => void
  t: TFunction
}) => {
  const [name, setName] = useState('')

  const create = useCallback(() => {
    onCreate(name)
  }, [name, onCreate])

  return (
    <div className='setting__token__form'>
      <h2>{t(lngKeys.CreateTokens)}</h2>
      <Form
        onSubmit={create}
        submitButton={{
          label: t(lngKeys.GeneralCreate),
          disabled: name.length === 0,
        }}
        rows={[
          {
            title: t(lngKeys.GeneralName),
            required: true,
            items: [
              {
                type: 'input',
                props: {
                  placeholder: t(lngKeys.TokensName),
                  value: name,
                  onChange: (e: ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value)
                  },
                },
              },
            ],
          },
        ]}
      />
    </div>
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

  .setting__token__form {
    width: 100%;
  }

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
  }

  .item-info-text {
    padding-right: ${({ theme }) => theme.sizes.spaces.df}px;

    h3 {
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
        text-decoration: underline;
      }
    }
  }
`

export default withApiTokens(ApiTab)
