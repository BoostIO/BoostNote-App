import React from 'react'
import Box from '../atoms/Box'
import Text from '../atoms/Text'
import FlexBox from '../atoms/FlexBox'
import styled from '../../lib/styled'

const RoadmapImage = styled.img`
  border-radius: 5px;
  max-width: 100%;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.5);
  &:hover {
    transform: translateY(-3px);
    transition: 0.2s cubic-bezier(0, 0, 0.25, 1);
  }
`

const RoadmapSection = () => {
  return (
    <section>
      <Box bg='#2c2c2c' color='#f0f0f0' py={4} px={2}>
        <Text as='h2' fontSize={4} my={4} textAlign='center'>
          🏃 Roadmap 2020
        </Text>

        <FlexBox justifyContent='center' my={4}>
          <a
            target='_blank'
            rel='noopener noreferrer'
            href='https://medium.com/boostnote/boost-note-roadmap-2020-9f06a642f5f1'
          >
            <RoadmapImage width='600' src='/static/roadmap2020.png' />
          </a>
        </FlexBox>
      </Box>
    </section>
  )
}

export default RoadmapSection
