import React, { useCallback } from 'react'
import { mdiPlusBoxOutline, mdiTrashCanOutline } from '@mdi/js'
import EmbedForm from '../forms/EmbedForm'
import {
  Block,
  BlockCreateRequestBody,
  ContainerBlock,
} from '../../../api/blocks'
import styled from '../../../../design/lib/styled'
import { BlockView, ViewProps } from '.'
import { getBlockDomId } from '../../../lib/blocks/dom'
import { useModal } from '../../../../design/lib/stores/modal'
import BlockCreationModal from '../BlockCreationModal'
import BlockToolbar from '../BlockToolbar'
import BlockLayout from '../BlockLayout'
import {
  markdownBlockEventEmitter,
  tableBlockEventEmitter,
} from '../../../lib/utils/events'
import { sleep } from '../../../../lib/sleep'

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

  const domBlockCreationHandler = useCallback(
    async (createdBlock: Block) => {
      await sleep(100) //rendering delay
      const blockElem = document.getElementById(getBlockDomId(createdBlock))
      scrollToElement(blockElem)
      if (createdBlock.type === 'table') {
        tableBlockEventEmitter.dispatch({
          type: 'focus-title',
          id: createdBlock.id,
        })
      } else if (createdBlock.type === 'markdown') {
        markdownBlockEventEmitter.dispatch({
          type: 'edit',
          id: createdBlock.id,
        })
      }
    },
    [scrollToElement]
  )

  const createBlock = useCallback(
    async (newBlock: BlockCreateRequestBody) => {
      await actions.create(newBlock, block, {
        afterSuccess: (createdBlock) => {
          if (canvas.rootBlock.id === block.id) {
            setCurrentBlock(createdBlock)
          }
          domBlockCreationHandler(createdBlock)
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
      domBlockCreationHandler,
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
        {!isRootBlock && <h1>{block.name}</h1>}
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
