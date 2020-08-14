import React from 'react'
import Text from '../atoms/Text'
import Row from '../atoms/Row'
import Column from '../atoms/Column'
import styled from '../../lib/styled'
import { space, SpaceProps } from 'styled-system'
import ButtonLink from '../atoms/ButtonLink'
import Link from 'next/link'

const Container = styled.div<SpaceProps>`
  max-width: 72em;
  margin: 0 auto;
  ${space}
`

const CampaignImage = styled.img`
  width: 100%;
`

const KickstarterCampaignSection = () => {
  return (
    <section>
      <Container mt={[0, 0, 5, 5]} mb={7}>
        <Row>
          <Column width={[1, 1, 1 / 2, 1 / 2]} mb={[4, 4, 0, 0]}>
            <Text as='h2' fontSize={[3, 4, 5]}>
              Thank you for supporting our Kickstarter campaign
            </Text>
            <Text as='p'>
              127 people sponsored the campaign. Based on their pledges, we
              could provide the new Boost Note around the world!
            </Text>
            <Link href='/backers'>
              <ButtonLink backgroundColor='teal' color='white'>
                See All Backers
              </ButtonLink>
            </Link>
          </Column>
          <Column width={[1, 1, 1 / 2, 1 / 2]}>
            <CampaignImage src='/static/kickstarter-campaign.svg' />
          </Column>
        </Row>
      </Container>
    </section>
  )
}

export default KickstarterCampaignSection
