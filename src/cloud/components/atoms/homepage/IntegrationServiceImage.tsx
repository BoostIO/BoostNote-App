import React from 'react'
import styled from '../../../lib/styled'

interface IntegrationServiceImageProps {
  src: string
}

const IntegrationServiceImage = ({ src }: IntegrationServiceImageProps) => {
  return (
    <StyledContainer>
      <img className='image' src={src} />
    </StyledContainer>
  )
}

export default IntegrationServiceImage

const StyledContainer = styled.div`
  width: 200px;
  height: 200px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: white;
  margin-bottom: 15px;
  & > .image {
    width: 100%;
  }
`
