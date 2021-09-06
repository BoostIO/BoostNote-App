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
import { getTableBlockInputId } from './Table'
import { markdownBlockEventEmitter } from '../../../lib/utils/events'

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
  scrollToElement,
  setCurrentBlock,
}: ContainerViewProps) => {
  const { openModal, closeAllModals } = useModal()

  const createBlock = useCallback(
    async (newBlock: BlockCreateRequestBody) => {
      const createdBlock = await actions.create(newBlock, block)
      closeAllModals()
      const blockElem = document.getElementById(getBlockDomId(createdBlock))
      scrollToElement(blockElem)

      if (createdBlock.type === 'table') {
        const titleElement = document.getElementById(
          getTableBlockInputId(createdBlock)
        )
        if (titleElement != null) titleElement.focus()
      } else if (newBlock.type === 'markdown') {
        markdownBlockEventEmitter.dispatch({
          type: 'edit',
          id: createdBlock.id,
        })
      }
    },
    [block, actions, closeAllModals, scrollToElement]
  )

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
        <h1>{canvas.rootBlock.id === block.id ? canvas.title : block.name}</h1>
      </BlockLayout>
      <div className='block__view__container__content'>
        {block.children.map((child) => {
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
            />
          )
        })}
      </div>
      {!isChild && (
        <BlockToolbar
          controls={[
            {
              iconPath: mdiPlusBoxOutline,
              label: 'Add Block',
              onClick: () =>
                openModal(
                  <BlockCreationModal
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
      )}
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
