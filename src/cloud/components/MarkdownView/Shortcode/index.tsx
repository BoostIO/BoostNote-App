import React, { useMemo } from 'react'
import GithubPR from './github/GithubPr'
import GithubIssue from './github/GithubIssue'
import { keyframes } from 'styled-components'
import { mdiRefresh, mdiExclamation } from '@mdi/js'
import cc from 'classcat'
import {
  useExternalEntities,
  ErrorKind,
  Status,
  ErrorStatus,
} from '../../../lib/stores/externalEntities'
import ServiceConnect from '../../ServiceConnect'
import { isGithubPr, isGithubIssue } from './github/utils'
import styled from '../../../../design/lib/styled'
import Spinner from '../../../../design/components/atoms/Spinner'
import Icon from '../../../../design/components/atoms/Icon'

interface ShortcodeProps {
  entity: string
  id: string
  original: string
}

interface Embed<T> {
  validator: (data: any) => data is T
  component: (props: { data: T }) => React.ReactElement
}

const EMBEDS = new Map<string, Embed<any>>()
EMBEDS.set('github.pr', { validator: isGithubPr, component: GithubPR })
EMBEDS.set('github.issue', { validator: isGithubIssue, component: GithubIssue })

const Shortcode = ({ entity, id, original }: ShortcodeProps) => {
  const embed = EMBEDS.get(entity)
  const { getEntity, refreshEntity } = useExternalEntities()

  const externalEntity = useMemo(() => {
    return getEntity(entity, id)
  }, [getEntity, entity, id])

  if (embed == null) {
    return <span>{original}</span>
  }

  const { validator, component: Component } = embed

  if (externalEntity.type === 'loading') {
    return (
      <LoadingBlock>
        <Spinner />
      </LoadingBlock>
    )
  }

  return (
    <StyledEmbedWrapper>
      {externalEntity.type === 'success' && validator(externalEntity.data) ? (
        <Component data={externalEntity.data} />
      ) : (
        <ErrorBlock>
          <Icon path={mdiExclamation} size={26} />
          <span>
            <span className='error-title'>Error loading embed.</span>
            {isError(externalEntity) && (
              <>
                <span>{errorTypeToMessage(externalEntity.kind)}</span>
                {externalEntity.kind === 'MissingIntegration' && (
                  <span className='register-action'>
                    <ServiceConnect
                      service='github'
                      onConnect={() => refreshEntity(entity, id)}
                    >
                      Register
                    </ServiceConnect>
                  </span>
                )}
              </>
            )}
          </span>
        </ErrorBlock>
      )}
      <span
        className={cc(['refresh', { working: externalEntity.refreshing }])}
        onClick={() => refreshEntity(entity, id)}
      >
        <Icon path={mdiRefresh} />
      </span>
    </StyledEmbedWrapper>
  )
}

function isError(status: Status): status is ErrorStatus {
  return status.type === 'error'
}

function errorTypeToMessage(type: ErrorKind) {
  switch (type) {
    case 'NotFound':
      return 'This entity does not exist.'
    case 'Permission':
      return 'You do no have permission to access this resource.'
    case 'ServerError':
      return 'Something went wrong!'
    case 'MissingIntegration':
      return 'You have not registered an integration for this service.'
  }
}

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }

`
const StyledEmbedWrapper = styled.span`
  position: relative;
  display: inline-block;

  & > .refresh {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    padding: 5px;
    cursor: pointer;
    opacity: 0;

    & > svg {
      color: ${({ theme }) => theme.colors.background.primary};
    }
  }

  &:hover > .refresh {
    opacity: 1;
  }

  & > .refresh.working {
    opacity: 1;
    & > svg {
      animation: ${rotate} 1s linear infinite;
    }
  }
`

const LoadingBlock = styled.span`
  display: flex;
  width: 200px;
  height: 50px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  justify-content: center;
  align-items: center;
`

const ErrorBlock = styled.span`
  display: flex;
  min-height: 50px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: 10px;

  & .error-title {
    font-weight: 900;
    font-size: 24;
  }

  & .register-action {
    display: flex;
    justify-content: end;
  }

  & > svg {
    color: ${({ theme }) => theme.colors.variants.danger.base};
  }

  & span {
    display: block;
  }
`
export default Shortcode
