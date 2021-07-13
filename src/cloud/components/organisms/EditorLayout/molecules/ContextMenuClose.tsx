import { mdiChevronRight } from '@mdi/js'
import React, { useEffect, useRef, useState } from 'react'
import Button from '../../../../../shared/components/atoms/Button'
import styled from '../../../../../shared/lib/styled'
import { usePreferences } from '../../../../lib/stores/preferences'

const ContextMenuClose = () => {
  const { setPreferences } = usePreferences()
  const prevOffset = useRef<number>(325)
  const [offsetRight, setOffsetRight] = useState(325)

  useEffect(() => {
    const resizeHandler = () => {
      const contextElement = document.getElementById('content__layout__right')
      if (contextElement == null) {
        return
      }

      const width = contextElement.getBoundingClientRect().width
      if (width === prevOffset.current) {
        return
      }

      setOffsetRight(width)
      prevOffset.current = width
    }
    window.addEventListener('resize', resizeHandler)

    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])

  return (
    <Container offset={offsetRight}>
      <Button
        variant='icon'
        iconPath={mdiChevronRight}
        className='context__menu__close'
        onClick={() => setPreferences({ docContextMode: undefined })}
      />
    </Container>
  )
}

const Container = styled.div<{ offsetRight: number }>`
  .context__menu__close {
    position: fixed;
    top: 60px;
    right: ${({ offsetRight }) => offsetRight}px;
    transform: translateX(-50%);
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid transparent;

    &:hover {
      background: ${({ theme }) => theme.colors.background.quaternary};
    }

    &:focus {
      border: 1px solid ${({ theme }) => theme.colors.text.link};
      background: ${({ theme }) => theme.colors.variants.primary.base};
    }
  }
`

export default ContextMenuClose
