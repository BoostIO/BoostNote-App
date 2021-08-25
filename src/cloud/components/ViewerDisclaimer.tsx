import { mdiOpenInNew } from '@mdi/js'
import React from 'react'
import Icon from '../../design/components/atoms/Icon'
import { ExternalLink } from '../../design/components/atoms/Link'
import styled from '../../design/lib/styled'
import { useI18n } from '../lib/hooks/useI18n'
import { lngKeys } from '../lib/i18n/types'
import { usePage } from '../lib/stores/pageStore'

const ViewerDisclaimer = () => {
  const { currentUserIsCoreMember } = usePage()
  const { translate } = useI18n()

  if (currentUserIsCoreMember) {
    return null
  }

  return (
    <Container className='viewer__disclaimer'>
      <p>
        {translate(lngKeys.ViewerDisclaimerIntro)}{' '}
        <ExternalLink
          className='viewer__disclaimer__link'
          href='https://intercom.help/boostnote-for-teams/en/articles/4354888-roles'
        >
          {translate(lngKeys.GeneralViewer)}
          <Icon path={mdiOpenInNew} />
        </ExternalLink>
      </p>
      <p>{translate(lngKeys.ViewerDisclaimerDescription)}</p>
    </Container>
  )
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.variants.info.base};
  color: ${({ theme }) => theme.colors.variants.info.text};
  padding: ${({ theme }) => theme.sizes.spaces.sm}px
    ${({ theme }) => theme.sizes.spaces.df}px;
  border-radius: ${({ theme }) => theme.borders.radius}px;

  margin: 0 ${({ theme }) => theme.sizes.spaces.df}px;

  .viewer__disclaimer__link {
    font-weight: bold;
    display: inline-flex;
    color: inherit;
    align-items: center;
  }

  p {
    margin: 0;
  }

  p + p {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

export default React.memo(ViewerDisclaimer)
