import React from 'react'
import {
  ContentWrapper,
  ContentWrapperProps,
} from '../../design/components/templates/ContentLayout'

const ApplicationContent: React.FC<ContentWrapperProps> = ({ children }) => (
  <ContentWrapper>{children}</ContentWrapper>
)

export default ApplicationContent
