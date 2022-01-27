import React from 'react'
import {
  ContentWrapper,
  ContentWrapperProps,
} from '../../design/components/templates/ContentLayout'

const ApplicationContent: React.FC<ContentWrapperProps> = ({ children }) => {
  return <ContentWrapper>{children}</ContentWrapper>
}

export default ApplicationContent
