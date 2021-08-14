import React, { useCallback, useMemo, useState } from 'react'
import styled from '../../../lib/styled'
import Image from '../../../../components/atoms/Image'
import { mdiArrowExpandAll } from '@mdi/js'
import Icon from '../../atoms/Icon'
import { flexCenter } from '../../../lib/styled/styleFunctions'
import {
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
} from '../../../../cloud/lib/keyboard'
import { useModal } from '../../../lib/stores/modal'
import ImagePreview from './ImagePreview'

interface ExpandableImageProps {
  src: string
}

const ExpandableImage = ({ src }: ExpandableImageProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [showingEnlargedImage, setShowingEnlargedImage] = useState<boolean>(
    false
  )
  const { closeLastModal, openModal } = useModal()
  const onImageExpand = useCallback(() => {
    closeLastModal()

    openModal(<ImagePreview src={src} />, {
      showCloseIcon: true,
      width: 'full',
    })
    setShowingEnlargedImage(true)
  }, [closeLastModal, openModal, src])

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (
        isSingleKeyEventOutsideOfInput(event, 'escape') &&
        showingEnlargedImage
      ) {
        preventKeyboardEventPropagation(event)
        closeLastModal()
      }
    }
  }, [closeLastModal, showingEnlargedImage])
  useGlobalKeyDownHandler(keydownHandler)

  return (
    <ImageContainer
      onClick={() => onImageExpand()}
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image src={src} />

      {isHovered && (
        <>
          <ImageActionButton
            onClick={() => {
              onImageExpand()
            }}
          >
            <Icon path={mdiArrowExpandAll} />
          </ImageActionButton>
        </>
      )}
    </ImageContainer>
  )
}

const ImageContainer = styled.span`
  position: relative;
  cursor: pointer;
  display: block;
`

const ImageActionButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  height: 30px;
  width: 30px;
  box-sizing: border-box;
  font-size: 18px;
  outline: none;

  background-color: rgba(0, 0, 0, 0.3);
  ${flexCenter};

  border: none;
  cursor: pointer;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.colors.text.primary};
  &:hover {
    color: ${({ theme }) => theme.colors.text.link};
  }

  &:active,
  &.active {
    color: ${({ theme }) => theme.colors.text.subtle};
  }
`

export default ExpandableImage
