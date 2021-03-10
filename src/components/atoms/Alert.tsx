import React from 'react'
import styled from '../../lib/styled'

interface AlertProps {
  variant?: 'primary' | 'secondary' | 'danger'
}

const Alert: React.FC<AlertProps> = ({ variant = 'secondary', children }) => {
  return (
    <Container className={`alert--variant-${variant}`}>{children}</Container>
  )
}

export default Alert

const Container = styled.div`
  color: white;
  margin-bottom: 15px;
  &:last-child {
    margin-bottom: 0;
  }

  &.alert--variant-primary {
    background-color: ${({ theme }) => theme.primaryColor};
  }
  &.alert--variant-secondary {
    background-color: #34363a;
  }
  &.alert--variant-danger {
    background-color: #ef5b5b;

    a {
      color: white;
    }
  }

  padding: 10px;
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  ul,
  ol {
    margin-bottom: 5px;
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }

  p {
    line-height: 1.8;
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }

  ul,
  ol {
    padding-left: 24px;
  }
  li {
    line-height: 1.8;
  }

  a {
    color: ${({ theme }) => theme.primaryColor};
  }
`
