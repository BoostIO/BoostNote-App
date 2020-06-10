import React from 'react'
import DefaultLayout from '../components/DefaultLayout'
import Container from '../components/atoms/Container'
import Text from '../components/atoms/Text'
import Row from '../components/atoms/Row'
import Column from '../components/atoms/Column'
import { backers } from '../lib/backers'

const BackersPage = () => (
  <DefaultLayout>
    <Container py={9} px={4}>
      <Text as='h1' textAlign='center' fontSize={[3, 4, 5]}>
        Our Honorable Kickstarter Campaign Backers
      </Text>
      <Row>
        {backers.map((backer) => {
          return (
            <Column
              key={backer.name}
              width={[1 / 2, 1 / 3, 1 / 3, 1 / 5]}
              height='100px'
              alignItems='center'
              justifyContent='center'
              display='flex'
            >
              <div>
                <Text fontSize={2} textAlign='center'>
                  {backer.name}
                </Text>
                {backer.twitterUserName && (
                  <Text fontSize={1} textAlign='center'>
                    <a
                      href={`https://twitter.com/${backer.twitterUserName}`}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      @{backer.twitterUserName}
                    </a>
                  </Text>
                )}
              </div>
            </Column>
          )
        })}
      </Row>
      <Text textAlign='center' fontSize={2}>
        ... and 8 Anonymous Backers
      </Text>
    </Container>
  </DefaultLayout>
)

export default BackersPage
