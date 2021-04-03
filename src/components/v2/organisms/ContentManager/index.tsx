import React from 'react'
import styled from '../../../../lib/v2/styled'
import cc from 'classcat'

interface ContentManagerProps {
  className?: string
  push: (href: string) => void
  categories: { label: string; items: ContentManagerItemProps[] }[]
}

interface ContentManagerItemProps {
  label: string
  href: string
  lastUpdated: string
  controls: []
  lastUpdatedBy?: string[]
  badges?: string[]
}

const ContentManager = ({ className }: ContentManagerProps) => {
  return <Container className={cc(['content__manager', className])}></Container>
}

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 1080px;
`

export default ContentManager
