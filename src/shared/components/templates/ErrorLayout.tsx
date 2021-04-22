import React from 'react'
import ContentLayout from './ContentLayout'

interface ErrorLayoutProps {
  message: string
}

const ErrorLayout = ({ message }: ErrorLayoutProps) => (
  <ContentLayout>{message}</ContentLayout>
)

export default ErrorLayout
