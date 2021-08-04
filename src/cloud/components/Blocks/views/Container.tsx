import React, { useState, useCallback, useMemo } from 'react'
import { ViewProps } from '../BlockContent'
import EmbedView from './Embed'
import MarkdownView from './Markdown'
import TableView from './Table'
import {
  mdiPlusBoxOutline,
  mdiFileDocumentOutline,
  mdiTable,
  mdiCodeTags,
} from '@mdi/js'
import MarkdownForm from '../forms/MarkdownForm'
import TableForm from '../forms/TableForm'
import EmbedForm from '../forms/EmbedForm'
import { Block, ContainerBlock } from '../../../api/blocks'
import { useModal } from '../../../../design/lib/stores/modal'
import Icon from '../../../../design/components/atoms/Icon'
import styled from '../../../../design/lib/styled'
import AspectRatio from '../../../../design/components/atoms/AspectRation'

interface ContainerViewProps extends ViewProps<ContainerBlock> {
  nested?: boolean
}

const ContainerView = ({
  block,
  actions,
  canvas,
  nested,
}: ContainerViewProps) => {
  const { openModal, closeAllModals } = useModal()
  const [addSelectOpen, setAddSelectOpen] = useState(false)

  const createBlock = useCallback(
    async (newBlock: Omit<Block, 'id'>) => {
      await actions.create(newBlock, block)
      setAddSelectOpen(false)
      closeAllModals()
    },
    [block, actions, closeAllModals]
  )

  const modalOptions = useMemo(() => {
    return {
      showCloseIcon: true,
      width: 'small' as const,
      title: 'Create new block',
    }
  }, [])

  const createMarkdown = useCallback(() => {
    openModal(<MarkdownForm onSubmit={createBlock} />, modalOptions)
  }, [createBlock, openModal, modalOptions])

  const createTable = useCallback(() => {
    openModal(<TableForm onSubmit={createBlock} />, modalOptions)
  }, [createBlock, openModal, modalOptions])

  const createEmbed = useCallback(() => {
    openModal(<EmbedForm onSubmit={createBlock} />, modalOptions)
  }, [createBlock, openModal, modalOptions])

  return (
    <StyledContainerView className={nested && 'block__view--nested'}>
      <h1>{canvas.rootBlock.id === block.id ? canvas.title : block.name}</h1>
      <div className='block__view__container__content'>
        {block.children.map((child) => {
          switch (child.type) {
            case 'container':
              return (
                <ContainerView
                  block={child}
                  actions={actions}
                  nested={true}
                  canvas={canvas}
                />
              )
            case 'embed':
              return (
                <AspectRatio width={16} height={9}>
                  <EmbedView block={child} actions={actions} canvas={canvas} />
                </AspectRatio>
              )
            case 'markdown':
              return (
                <MarkdownView block={child} actions={actions} canvas={canvas} />
              )
            case 'table':
              return (
                <TableView block={child} actions={actions} canvas={canvas} />
              )
            default:
              return (
                <div>Block of type ${(child as any).type} is unsupported</div>
              )
          }
        })}
      </div>
      {!nested && (
        <div
          onClick={() => setAddSelectOpen((open) => !open)}
          className='block__view__container__add'
        >
          <Icon path={mdiPlusBoxOutline} size={16} />
          <span>Add Block</span>
        </div>
      )}
      {addSelectOpen && (
        <div className='block__view__container__add__select'>
          <h3>Select a block</h3>
          <div>
            <div
              onClick={createMarkdown}
              className='block__view__add__selector'
            >
              <Icon size={34} path={mdiFileDocumentOutline} />
              <span>Markdown</span>
            </div>
            <div onClick={createTable} className='block__view__add__selector'>
              <Icon size={34} path={mdiTable} />
              <span>Table</span>
            </div>
            <div onClick={createEmbed} className='block__view__add__selector'>
              <Icon size={34} path={mdiCodeTags} />
              <span>Embed</span>
            </div>
          </div>
        </div>
      )}
    </StyledContainerView>
  )
}

const StyledContainerView = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.sizes.spaces.df}px
    ${({ theme }) => theme.sizes.spaces.xl}px;

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
    margin-bottom: ${({ theme }) => theme.sizes.spaces.md}px;
  }

  & .block__view__container__add {
    display: flex;
    justify-content: center;
    cursor: pointer;

    border: 1px solid ${({ theme }) => theme.colors.border.main};
    padding: ${({ theme }) => theme.sizes.spaces.df}px;
    & span {
      margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
    }
  }

  & .block__view__container__add__select {
    margin: 0 auto;
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
    border-radius: 2px;
    background-color: ${({ theme }) => theme.colors.background.secondary};
    padding: ${({ theme }) => theme.sizes.spaces.df}px 0;
    width: 60%;
    & > h3 {
      text-align: center;
      margin-top: 0;
    }
    & > div {
      display: flex;
      justify-content: space-evenly;
      & .block__view__add__selector {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        span {
          margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
        }
      }
    }
  }
`

export default ContainerView
