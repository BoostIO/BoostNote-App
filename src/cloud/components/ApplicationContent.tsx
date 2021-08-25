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
        <Spinner variant='subtle' style={{ marginLeft: 15, marginTop: 15 }} />
      </ContentWrapper>
    )
  }

  return <ContentWrapper>{children}</ContentWrapper>
}

export default ApplicationContent
