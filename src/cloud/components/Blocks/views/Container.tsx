import React, { useCallback, useEffect, useRef, useState } from 'react'
import { mdiPlusBoxOutline, mdiTrashCanOutline } from '@mdi/js'
import EmbedForm from '../forms/EmbedForm'
import {
  Block,
  BlockCreateRequestBody,
  ContainerBlock,
} from '../../../api/blocks'
import styled from '../../../../design/lib/styled'
import { BlockView, ViewProps } from '.'
import { domBlockCreationHandler, getBlockDomId } from '../../../lib/blocks/dom'
import { useModal } from '../../../../design/lib/stores/modal'
import BlockCreationModal from '../BlockCreationModal'
import BlockToolbar from '../BlockToolbar'
import BlockLayout from '../BlockLayout'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import { useDebounce } from 'react-use'
import { BlockEventDetails, blockEventEmitter } from '../../../lib/utils/events'

interface ContainerViewProps extends ViewProps<ContainerBlock> {
  setCurrentBlock: React.Dispatch<React.SetStateAction<Block | null>>
  scrollToElement: (elem: HTMLElement | null) => void
}

const ContainerView = ({
  block,
  actions,
  canvas,
  isChild,
  realtime,
  currentUserIsCoreMember,
  sendingMap,
  scrollToElement,
  setCurrentBlock,
}: ContainerViewProps) => {
  const { openModal, closeAllModals } = useModal()
  const [containerTitle, setContainerTitle] = useState(block.name || '')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<string>(block.id)

  const createBlock = useCallback(
    async (newBlock: BlockCreateRequestBody) => {
      await actions.create(newBlock, block, {
        afterSuccess: (createdBlock) => {
          if (canvas.rootBlock.id === block.id) {
            setCurrentBlock(createdBlock)
          }
          domBlockCreationHandler(scrollToElement, createdBlock)
        },
      })
      closeAllModals()
    },
    [
      block,
      actions,
      closeAllModals,
      canvas.rootBlock.id,
      setCurrentBlock,
      scrollToElement,
    ]
  )

  const createContainer = useCallback(() => {
    return createBlock({
      name: 'Page',
      type: 'container',
      children: [],
      data: null,
    })
  }, [createBlock])

  const createMarkdown = useCallback(() => {
    return createBlock({
      name: '',
      type: 'markdown',
      children: [],
      data: null,
    })
  }, [createBlock])

  const createTable = useCallback(() => {
    return createBlock({
      name: '',
      type: 'table',
      children: [],
      data: { columns: {} },
    })
  }, [createBlock])

  const createEmbed = useCallback(() => {
    openModal(<EmbedForm onSubmit={createBlock} />, {
      showCloseIcon: true,
    })
  }, [createBlock, openModal])

  useEffect(() => {
    if (containerRef.current !== block.id) {
      containerRef.current = block.id
      setContainerTitle(block.name)
    }
  }, [block])
  const readyToBeSentRef = useRef<boolean>(false)
  const onNameChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      readyToBeSentRef.current = true
      setContainerTitle(e.target.value)
    },
    []
  )
  const [, cancel] = useDebounce(
    async () => {
      if (readyToBeSentRef.current) {
        await actions.update({
          id: block.id,
          type: block.type,
          name: containerTitle,
        })
        readyToBeSentRef.current = false
      } else {
        cancel()
      }
    },
    1000,
    [containerTitle]
  )

  useEffect(() => {
    const handler = ({ detail }: CustomEvent<BlockEventDetails>) => {
      if (detail.blockId !== block.id || detail.blockType !== block.type) {
        return
      }

      switch (detail.event) {
        case 'creation':
          if (titleInputRef.current != null) {
            titleInputRef.current.focus()
            titleInputRef.current.setSelectionRange(
              0,
              titleInputRef.current.value.length
            )
          }

          return
        default:
          return
      }
    }
    blockEventEmitter.listen(handler)
    return () => blockEventEmitter.unlisten(handler)
  }, [block])

  const isRootBlock = canvas.rootBlock.id === block.id

  return (
    <StyledContainerView
      className={isChild && 'block__view--nested'}
      id={getBlockDomId(block)}
    >
      <BlockLayout
        controls={
          currentUserIsCoreMember && isChild
            ? [
                {
                  iconPath: mdiTrashCanOutline,
                  onClick: () => actions.remove(block),
                },
              ]
            : []
        }
      >
        {!isRootBlock && (
          <FormInput
            placeholder='Untitled...'
            value={containerTitle}
            onChange={onNameChange}
            className='block__container__title'
            disabled={!currentUserIsCoreMember}
            ref={titleInputRef}
          />
        )}
      </BlockLayout>
      <div className='block__view__container__content'>
        {!isRootBlock &&
          block.children.map((child) => {
            return (
              <BlockView
                key={child.id}
                block={child}
                actions={actions}
                isChild={true}
                canvas={canvas}
                realtime={realtime}
                scrollToElement={scrollToElement}
                setCurrentBlock={setCurrentBlock}
                currentUserIsCoreMember={currentUserIsCoreMember}
                sendingMap={sendingMap}
              />
            )
          })}
      </div>
      <BlockToolbar
        controls={[
          {
            iconPath: mdiPlusBoxOutline,
            label: 'Add Block',
            onClick: () =>
              openModal(
                <BlockCreationModal
                  onContainerCreation={
                    isRootBlock ? createContainer : undefined
                  }
                  onMarkdownCreation={createMarkdown}
                  onEmbedCreation={createEmbed}
                  onTableCreation={createTable}
                />,
                {
                  title: 'Add a block',
                  showCloseIcon: true,
                }
              ),
          },
        ]}
      />
    </StyledContainerView>
  )
}

const StyledContainerView = styled.div`
  width: 100%;

  .block__container__title {
    width: 100%;
    border: 0;
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
    font-weight: 600;
    padding: ${({ theme }) => theme.sizes.spaces.df}px
      ${({ theme }) => theme.sizes.spaces.md}px;
    height: auto;

    &:hover {
      background: ${({ theme }) => theme.colors.background.secondary};
    }
  }

  & > & h1 {
    font-size: 5px;
  }

  &.block__view--nested {
    padding: 0;
    & h1 {
      font-size: ${({ theme }) => theme.sizes.fonts.md}px;
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }

  & .block__view__container__content > * {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export default ContainerView
