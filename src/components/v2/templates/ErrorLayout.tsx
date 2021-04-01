import React from 'react'
import ContentLayout from './ContentLayout'

interface ErrorLayoutProps {
  message: string
}

const ErrorLayout = ({ message }: ErrorLayoutProps) => (
  <ContentLayout topbar={{}}>{message}</ContentLayout>
)

export default ErrorLayout
