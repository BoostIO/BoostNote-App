import React, { useRef } from 'react'
import { useEffectOnce } from 'react-use'
import { focusFirstChildFromElement } from '../../../lib/v2/dom'
import styled from '../../../lib/v2/styled'
import { AppComponent } from '../../../lib/v2/types'

interface MetadataContainerProps {
  rows: MetadataContainerRow[]
}

interface MetadataContainerRow {
  breakAfter?: boolean
}

const MetadataContainer: AppComponent<MetadataContainerProps> = ({}) => {
  const menuRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<
    HTMLDivElement
  >

  useEffectOnce(() => {
    if (menuRef.current != null) {
      focusFirstChildFromElement(menuRef.current)
    }
  })

  return (
    <Container ref={menuRef} className='metadata'>
      <div className='metadata__container'>
        <div className='metadata__scroll__container'>
          <div className='context__scroll'></div>
        </div>
      </div>
    </Container>
  )
}

const containerWidth = 350
const Container = styled.div`
  width: ${containerWidth}px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-left: 1px solid transparent;
  background-color: ${({ theme }) => theme.colors.background.second};
  color: ${({ theme }) => theme.colors.text.main};

  .metadata__container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .metadata__scroll__container {
    height: 100%;
    overflow: auto;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    scrollbar-width: thin;
    &::-webkit-scrollbar {
      width: 6px;
    }
  }

  .metadata__scroll {
    flex: 1 1 auto;
    width: 100%;
    overflow: hidden auto;
  }

  .metadata__row,
  .metadata__column {
    position: relative;
    display: flex;
    align-items: flex-start;
    line-height: 30px;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    padding: 0px ${({ theme }) => theme.sizes.spaces.sm}px;
    height: fit-content;
  }

  .metadata__column {
    flex-direction: column;
  }

  .metadata__column + .metadata__break,
  .metadata__row + .metadata__break {
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .metadata__row + .metadata__row,
  .metadata__break + .metadata__row,
  .metadata__column + .metadata__column,
  .metadata__break + .metadata__column {
    padding-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    padding-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export default MetadataContainer
