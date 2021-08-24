import React from 'react'
import {
  ContentLayoutContent,
  ContentLayoutContentProps,
} from '../../design/components/templates/ContentLayout'

const ApplicationContent: React.FC<ContentLayoutContentProps> = ({
  children,
}) => <ContentLayoutContent>{children}</ContentLayoutContent>

export default ApplicationContent
