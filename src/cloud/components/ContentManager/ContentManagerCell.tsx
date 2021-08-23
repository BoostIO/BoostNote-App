import React from 'react'
import styled from '../../../design/lib/styled'
import { AppComponent } from '../../../design/lib/types'
import cc from 'classcat'

interface ContentManagerCellProps {
  fullWidth?: boolean
}

const ContentManagerCell: AppComponent<ContentManagerCellProps> = ({
  className,
  children,
  fullWidth,
}) => (
  <Container
    className={cc([`cm__cell`, fullWidth && `cm__cell--full`, className])}
  >
    {children}
  </Container>
)

const Container = styled.div`
  margin: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
  width: 120px;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.subtle};
  text-transform: initial;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  &.cm__cell--full {
    .doc__status__select,
    .doc__assignee__select,
    .doc__due-date__select {
      width: 100% !important;
      flex: 1 1 auto;

      .doc__property__button,
      .react-datepicker-wrapper {
        width: 100% !important;
        flex: 1 1 auto;
      }
    }
  }
`

export default ContentManagerCell
