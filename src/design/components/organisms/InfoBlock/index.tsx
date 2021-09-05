import React, { useState } from 'react'
import { AppComponent } from '../../../lib/types'
import cc from 'classcat'
import styled from '../../../lib/styled'
import Flexbox from '../../atoms/Flexbox'
import Icon from '../../atoms/Icon'
import Button from '../../atoms/Button'
import { mdiArrowLeft, mdiArrowRight } from '@mdi/js'

interface InfoBlockProps {
  title?: string
  titleIcon?: string | React.ReactNode
  rows?: InfoBlockRow[]
}

const InfoBlock: AppComponent<InfoBlockProps> = ({
  title,
  titleIcon,
  rows = [],
  className,
  children,
}) => {
  return (
    <Container className={cc(['info__block', className])}>
      {(title != null || titleIcon != null) && (
        <Flexbox alignItems='center' className='info__block__title'>
          {typeof titleIcon === 'string' ? (
            <Icon path={titleIcon} size={26} />
          ) : (
            titleIcon
          )}
          {title != null && <h1>{title}</h1>}
        </Flexbox>
      )}
      {rows.map((row, i) => (
        <InfoBlockRow key={`${i}-${row.label}`} {...row} />
      ))}
      {children}
    </Container>
  )
}

const Container = styled.div`
  .info__block__title {
    color: ${({ theme }) => theme.colors.text.primary};
    .icon {
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
  }

  .info__block__row + .info__block__row {
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export default InfoBlock

export interface InfoBlockRow {
  label?: string
  labelIcon?: string | React.ReactNode
  content?: string | React.ReactNode
  minimized?: boolean
}

export const InfoBlockRow: AppComponent<InfoBlockRow> = ({
  label,
  labelIcon,
  content,
  minimized,
  className,
  children,
}) => {
  const [showContent, setShowContent] = useState(minimized)
  return (
    <RowContainer className={cc(['info__block__row', className])}>
      <Flexbox alignItems='center' className='info__block__row__label'>
        {labelIcon != null ? (
          typeof labelIcon === 'string' ? (
            <Icon path={labelIcon} size={26} />
          ) : (
            labelIcon
          )
        ) : null}
        <span>{label}</span>
      </Flexbox>
      <div
        className={cc([
          'info__block__row__content',
          showContent != null && 'info__block__row__content--minimized',
        ])}
      >
        {showContent != null && (
          <Button
            className='info__block__row__content__toggle'
            variant='icon'
            size='sm'
            iconPath={showContent ? mdiArrowLeft : mdiArrowRight}
            iconSize={16}
            onClick={() => setShowContent((prev) => !prev)}
          />
        )}
        {showContent !== false && (
          <div className='info__block__row__content__wrapper'>
            {content}
            {children}
          </div>
        )}
      </div>
    </RowContainer>
  )
}

const RowContainer = styled.div`
  display: flex;
  width: 100%;
  height: fit-content;
  align-items: center;

  > * {
    min-height: 20px;
  }

  .info__block__row__label {
    width: calc(100% / 4);
    min-width: 100px;
    max-width: 200px;
    flex-direction: row;
    flex-wrap: wrap;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .info__block__row__content__toggle {
    flex: 0 0 auto;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .info__block__row__content,
  .info__block__row__content__wrapper {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
  }
`
