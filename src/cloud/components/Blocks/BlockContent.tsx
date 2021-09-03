import React, { useCallback, useState, useMemo, useEffect } from 'react'
import {
  mdiPlus,
  mdiChevronDown,
  mdiPackageVariantClosed,
  mdiCodeTags,
  mdiTable,
  mdiFileDocumentOutline,
  mdiChevronLeft,
} from '@mdi/js'
import MarkdownForm from './forms/MarkdownForm'
import EmbedForm from './forms/EmbedForm'
import TableForm from './forms/TableForm'
import { Block, ContainerBlock } from '../../api/blocks'
import { useDocBlocks } from '../../lib/hooks/useDocBlocks'
import { SerializedDocWithBookmark } from '../../interfaces/db/doc'
import { useModal } from '../../../design/lib/stores/modal'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import ContainerForm from './forms/ContainerForm'
import BlockTree from './BlockTree'
import Icon from '../../../design/components/atoms/Icon'
import styled from '../../../design/lib/styled'
import { find } from '../../../design/lib/utils/tree'
import useRealtime from '../../lib/editor/hooks/useRealtime'
import { BlockView } from './views'

export interface Canvas extends SerializedDocWithBookmark {
  rootBlock: ContainerBlock
}

export interface FormProps<T extends Block> {
  onSubmit: (block: Omit<T, 'id'>) => Promise<any>
}

interface BlockContentProps {
  doc: Canvas
}

const BlockContent = ({ doc }: BlockContentProps) => {
  const { state, actions } = useDocBlocks(doc.rootBlock.id)
  const { openModal, closeAllModals } = useModal()
  const { translate } = useI18n()
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null)
  const [showActions, setShowActions] = useState(true)
  const [provider] = useRealtime({
    token: doc.collaborationToken || '',
    id: doc.id,
  })

  const createBlock = useCallback(
    async (block: Omit<Block, 'id'>) => {
      await actions.create(block, doc.rootBlock)
      closeAllModals()
    },
    [doc, actions, closeAllModals]
  )

  useEffect(() => {
    if (state.type === 'loaded') {
      setCurrentBlock((prev) => {
        return prev != null
          ? find(state.block, (block) => block.id === prev.id)
          : null
      })
    }
  }, [state])

  const modalOptions = useMemo(() => {
    return {
      showCloseIcon: true,
      title: translate(lngKeys.ModalsCreateNewDocument),
    }
  }, [translate])

  const createContainer = useCallback(() => {
    openModal(<ContainerForm onSubmit={createBlock} />, modalOptions)
  }, [createBlock, openModal, modalOptions])

  const createMarkdown = useCallback(() => {
    openModal(<MarkdownForm onSubmit={createBlock} />, modalOptions)
  }, [createBlock, openModal, modalOptions])

  const createTable = useCallback(() => {
    openModal(<TableForm onSubmit={createBlock} />, modalOptions)
  }, [createBlock, openModal, modalOptions])

  const createEmbed = useCallback(() => {
    openModal(<EmbedForm onSubmit={createBlock} />, modalOptions)
  }, [createBlock, openModal, modalOptions])

  if (state.type === 'loading') {
    return <div>loading</div>
  }

  return (
    <StyledBlockContent>
      <div className='block__editor__nav'>
        <BlockTree
          root={state.block}
          active={currentBlock || doc.rootBlock}
          onSelect={setCurrentBlock}
          onDelete={actions.remove}
        />
        <div className='block__editor__nav--actions'>
          <div
            className='block__editor__nav--item'
            onClick={() => setShowActions((state) => !state)}
          >
            <span>New Items</span>
            <Icon
              path={showActions ? mdiChevronDown : mdiChevronLeft}
              size={16}
            />
          </div>
          {showActions && (
            <ul>
              <li
                onClick={createContainer}
                className='block__editor__nav--item'
              >
                <Icon path={mdiPackageVariantClosed} size={16} />
                <span>Container</span>
                <Icon path={mdiPlus} size={16} />
              </li>
              <li onClick={createMarkdown} className='block__editor__nav--item'>
                <Icon path={mdiFileDocumentOutline} size={16} />
                <span>Markdown</span>
                <Icon path={mdiPlus} size={16} />
              </li>
              <li onClick={createTable} className='block__editor__nav--item'>
                <Icon path={mdiTable} size={16} />
                <span>Table</span>
                <Icon path={mdiPlus} size={16} />
              </li>
              <li onClick={createEmbed} className='block__editor__nav--item'>
                <Icon path={mdiCodeTags} size={16} />
                <span>Embed</span>
                <Icon path={mdiPlus} size={16} />
              </li>
            </ul>
          )}
        </div>
      </div>
      <div className='block__editor__view'>
        <BlockView
          block={currentBlock || state.block}
          actions={actions}
          canvas={doc}
          realtime={provider}
        />
      </div>
    </StyledBlockContent>
  )
}

const StyledBlockContent = styled.div`
  display: flex;
  height: 100%;

  & > .block__editor__nav {
    padding-top: ${({ theme }) => theme.sizes.spaces.df}px;
    display: flex;
    flex-direction: column;
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    width: 240px;
    flex: 0 0 auto;

    & > div:first-child {
      flex-grow: 1;
    }

    & .block__editor__nav--item {
      display: flex;
      width: 100%;
      height: 26px;
      white-space: nowrap;
      font-size: ${({ theme }) => theme.sizes.fonts.df}px;
      cursor: pointer;
      padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;

      align-items: center;
      flex: 1 1 auto;
      background: none;
      outline: 0;
      border: 0;
      text-align: left;
      color: ${({ theme }) => theme.colors.text.secondary};
      text-decoration: none;
      margin: 0;
      overflow: hidden;
      svg {
        color: ${({ theme }) => theme.colors.text.subtle};
      }
      span {
        flex: 1 0 auto;
      }

      &:hover {
        background-color: ${({ theme }) => theme.colors.background.secondary};
      }
    }
  }

  & .block__editor__nav--actions {
    & > ul {
      list-style: none;
      padding: 0;
      margin: 0;
      & > li {
        & span {
          margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
          flex: 1 0 auto;
        }
      }
    }
  }

  & .block__editor__view {
    flex: 1 1 auto;
    height: 100%;
    overflow: auto;
  }
`

export default BlockContent
