import React from 'react'
import styled from '../../../../lib/styled'
import cc from 'classcat'

interface TableSlider {
  hover?: boolean
}

const TableSlider = ({ hover }: TableSlider) => {
  return (
    <Container className={cc(['table-slider', hover && 'table-slider--hover'])}>
      <div className='table-slider__border' />
    </Container>
  )
}

export default TableSlider

const Container = styled.div`
  display: flex;
  justify-content: center;
  width: 5px;
  margin: 0 -2px;
  position: relative;
  z-index: 1;
  .table-slider--hover {
    background-color: ${({ theme }) => theme.colors.variants.info.base};
    .table-slider__border {
      background-color: ${({ theme }) => theme.colors.variants.info.text};
    }
  }

  .table-slider__border {
    width: 1px;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.border.main};
  }
`
