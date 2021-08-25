import React from 'react'
import Spinner from '../../design/components/atoms/Spinner'
import {
  ContentWrapper,
  ContentWrapperProps,
} from '../../design/components/templates/ContentLayout'
import { useNav } from '../lib/stores/nav'

const ApplicationContent: React.FC<ContentWrapperProps> = ({ children }) => {
  const { initialLoadDone } = useNav()

  if (!initialLoadDone) {
    return (
      <ContentWrapper>
        <Spinner />
      </ContentWrapper>
    )
  }

  return <ContentWrapper>{children}</ContentWrapper>
}

export default ApplicationContent
