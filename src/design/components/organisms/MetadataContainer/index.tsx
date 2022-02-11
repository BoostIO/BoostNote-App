import React from 'react'
import styled from '../../../lib/styled'
import { AppComponent } from '../../../lib/types'
import cc from 'classcat'
import UpDownList from '../../atoms/UpDownList'
import MetadataContainerRow, {
  MetadataContainerRowProps,
} from './molecules/MetadataContainerRow'

interface MetadataContainerProps {
  rows?: MetadataContainerRowProps[]
}

const MetadataContainer: AppComponent<MetadataContainerProps> = ({
  className,
  children,
  rows = [],
}) => (
  <UpDownList ignoreFocus={true}>
    <Container className={cc(['metadata', className])}>
      <div className='metadata__container'>
        <div className='metadata__scroll'>
          {rows.map((row, i) => (
            <MetadataContainerRow row={row} key={`row-${i}`} />
          ))}
          {children}
        </div>
      </div>
    </Container>
  </UpDownList>
)

const Container = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  border-left: 1px solid transparent;
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  .metadata__scroll {
    width: 100%;
    height: 100%;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px 0;
  }

  .metadata__container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .metadata__item--column + .metadata__break,
  .metadata__item + .metadata__break {
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .metadata__item + .metadata__item,
  .metadata__break + .metadata__item,
  .metadata__item--column + .metadata__item--column,
  .metadata__break + .metadata__item--column {
    padding-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    padding-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`

export default MetadataContainer
