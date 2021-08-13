import React, { useCallback, useMemo, useState } from 'react'
import styled from '../../../lib/styled'
import Image from '../../../../components/atoms/Image'
import { mdiArrowExpandAll, mdiClose } from '@mdi/js'
import Icon from '../../atoms/Icon'
import { flexCenter } from '../../../lib/styled/styleFunctions'
import {
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
} from '../../../../cloud/lib/keyboard'
import Button from '../../atoms/Button'

interface ExpandableImageProps {
  src: string
}

const ExpandableImage = ({ src }: ExpandableImageProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [showingEnlargedImage, setShowingEnlargedImage] = useState<boolean>(
    false
  )

  const onImageExpand = useCallback(() => {
    setShowingEnlargedImage(true)
  }, [])

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (
        isSingleKeyEventOutsideOfInput(event, 'escape') &&
        showingEnlargedImage
      ) {
        preventKeyboardEventPropagation(event)
        setShowingEnlargedImage(false)
      }
    }
  }, [showingEnlargedImage])
  useGlobalKeyDownHandler(keydownHandler)

  return (
    <Container>
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

      {showingEnlargedImage && (
        <FullImageContainer>
          <EnlargedImageContainer>
            <ImageOptionsContainer>
              <Button
                className={'enlarged--image--btn-style'}
                onClick={() => {
                  setShowingEnlargedImage(false)
                }}
                variant={'transparent'}
                iconPath={mdiClose}
              />
            </ImageOptionsContainer>
            <Image src={src} />
          </EnlargedImageContainer>
          {showingEnlargedImage && (
            <DimBackground onClick={() => setShowingEnlargedImage(false)} />
          )}
        </FullImageContainer>
      )}
    </Container>
  )
}

const EnlargedImageContainer = styled.span`
  position: relative;
  display: block;
  z-index: 9000;

  margin-left: 10%;
  margin-right: 10%;
`

const ImageOptionsContainer = styled.span`
  position: relative;
  display: block;
  .enlarged--image--btn-style {
    position: absolute;
    top: 0;
    right: 0;
    height: 30px;
    width: 30px;
    box-sizing: border-box;
    font-size: 18px;
    outline: none;

    margin-right: -2em;
    margin-bottom: -1em;
  }
`

const FullImageContainer = styled.span`
  position: fixed;
  z-index: 9000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  justify-content: center;
  align-items: center;
`

const DimBackground = styled.span`
  position: absolute;
  z-index: 6001;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
`

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

const Container = styled.span``

export default ExpandableImage
