import React from 'react'
import Box from '../atoms/Box'
import FlexBox from '../atoms/FlexBox'
import Text from '../atoms/Text'
import { useTranslation } from 'react-i18next'
import styled from '../../lib/styled'
import { space, SpaceProps } from 'styled-system'

const Container = styled.div<SpaceProps>`
  max-width: 60em;
  margin: 0 auto;
  ${space}
`

const CommunityLink = styled.a<SpaceProps>`
  ${space}
  color: #333;
  text-align: center;
  &:hover {
    text-decoration: underline;
  }
`
const CommunityListItem = styled.li<SpaceProps>`
  ${space}
`

const CommunitySection = () => {
  const { t } = useTranslation()
  return (
    <section>
      <Box py={4}>
        <Text as='h2' fontSize={[3, 4, 5]} my={4} textAlign='center'>
          🎙️ {t('community.title')}
        </Text>
        <Container my={4}>
          <Text as='p' textAlign='center'>
            {t('community.description')}
          </Text>
        </Container>
        <FlexBox
          as='ul'
          justifyContent='center'
          mx={2}
          mt={5}
          py={4}
          flexWrap='wrap'
        >
          <CommunityListItem mx={2}>
            <CommunityLink href='https://github.com/BoostIO/Boostnote.next'>
              <img src='/static/community-logos/github.svg' />
              <Text textAlign='center'>GitHub</Text>
            </CommunityLink>
          </CommunityListItem>
          <CommunityListItem mx={2}>
            <CommunityLink href='https://join.slack.com/t/boostnote-group/shared_invite/zt-cun7pas3-WwkaezxHBB1lCbUHrwQLXw'>
              <img src='/static/community-logos/slack.svg' />
              <Text textAlign='center'>Slack</Text>
            </CommunityLink>
          </CommunityListItem>
          <CommunityListItem mx={2}>
            <CommunityLink href='https://issuehunt.io/r/BoostIo/Boostnote.next'>
              <img src='/static/community-logos/issuehunt.svg' />
              <Text textAlign='center'>IssueHunt</Text>
            </CommunityLink>
          </CommunityListItem>
          <CommunityListItem mx={2}>
            <CommunityLink href='https://twitter.com/boostnoteapp'>
              <img src='/static/community-logos/twitter.svg' />
              <Text textAlign='center'>Twitter</Text>
            </CommunityLink>
          </CommunityListItem>
          <CommunityListItem mx={2}>
            <CommunityLink href='https://www.facebook.com/groups/boostnote/'>
              <img src='/static/community-logos/facebook.svg' />
              <Text textAlign='center'>Facebook</Text>
            </CommunityLink>
          </CommunityListItem>
          <CommunityListItem mx={2}>
            <CommunityLink href='https://www.reddit.com/r/Boostnote/'>
              <img src='/static/community-logos/reddit.svg' />
              <Text textAlign='center'>Reddit</Text>
            </CommunityLink>
          </CommunityListItem>
        </FlexBox>
      </Box>
    </section>
  )
}

export default CommunitySection
