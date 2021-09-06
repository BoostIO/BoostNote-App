import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react'
import {
  mdiPlus,
  mdiPackageVariantClosed,
  mdiCodeTags,
  mdiFileDocumentOutline,
} from '@mdi/js'
import EmbedForm from './forms/EmbedForm'
import { Block, BlockCreateRequestBody, ContainerBlock } from '../../api/blocks'
import { useDocBlocks } from '../../lib/hooks/useDocBlocks'
import { SerializedDocWithBookmark } from '../../interfaces/db/doc'
import { useModal } from '../../../design/lib/stores/modal'
import BlockTree from './BlockTree'
import Icon from '../../../design/components/atoms/Icon'
import styled from '../../../design/lib/styled'
import { find } from '../../../design/lib/utils/tree'
import useRealtime from '../../lib/editor/hooks/useRealtime'
import { BlockView } from './views'
import Scroller from '../../../design/components/atoms/Scroller'
import UpDownList from '../../../design/components/atoms/UpDownList'
import NavigationItem from '../../../design/components/molecules/Navigation/NavigationItem'
import Flexbox from '../../../design/components/atoms/Flexbox'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { useToast } from '../../../design/lib/stores/toast'
import { usePage } from '../../lib/stores/pageStore'
import {
  CollapsableType,
  useSidebarCollapse,
} from '../../lib/stores/sidebarCollapse'
import { FoldingProps } from '../../../design/components/atoms/FoldingWrapper'

export interface Canvas extends SerializedDocWithBookmark {
  rootBlock: ContainerBlock
}

export interface FormProps {
  onSubmit: (block: BlockCreateRequestBody) => Promise<any>
}

interface BlockContentProps {
  doc: Canvas
}

const BlockContent = ({ doc }: BlockContentProps) => {
  const { currentUserIsCoreMember } = usePage()
  const { state, actions } = useDocBlocks(doc.rootBlock.id)
  const { openModal, closeAllModals } = useModal()
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null)
  const [provider] = useRealtime({
    token: doc.collaborationToken || '',
    id: doc.id,
  })
  const { pushApiErrorMessage } = useToast()
  const contentScrollerRef = useRef<OverlayScrollbarsComponent>(null)

  const scrollToElement = useCallback((elem: HTMLElement | null) => {
    if (elem != null && contentScrollerRef.current != null) {
      const instance = contentScrollerRef.current.osInstance()
      if (instance != null) {
        instance.scroll({ el: elem, block: 'center' }, 300)
      }
    }
  }, [])

  const createBlock = useCallback(
    async (block: BlockCreateRequestBody) => {
      try {
        const newBlock = await actions.create(block, doc.rootBlock)
        closeAllModals()
        setCurrentBlock(newBlock)
      } catch (error) {
        pushApiErrorMessage(error)
      }
    },
    [doc, actions, closeAllModals, pushApiErrorMessage]
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

  const createMarkdown = useCallback(() => {
    return createBlock({
      name: 'Markdown',
      type: 'markdown',
      children: [],
      data: null,
    })
  }, [createBlock])

  const createContainer = useCallback(() => {
    return createBlock({
      name: 'Page',
      type: 'container',
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
    openModal(<EmbedForm onSubmit={createBlock} />)
  }, [createBlock, openModal])

  const {
    sideBarOpenedBlocksIdsSet,
    sideBarOpenedLinksIdsSet,
    toggleItem,
    unfoldItem,
    foldItem,
  } = useSidebarCollapse()

  const getFoldEvents = useCallback(
    (type: CollapsableType, key: string, reversed?: boolean) => {
      if (reversed) {
        return {
          fold: () => unfoldItem(type, key),
          unfold: () => foldItem(type, key),
          toggle: () => toggleItem(type, key),
        }
      }

      return {
        fold: () => foldItem(type, key),
        unfold: () => unfoldItem(type, key),
        toggle: () => toggleItem(type, key),
      }
    },
    [toggleItem, unfoldItem, foldItem]
  )

  const navTree = useMemo(() => {
    if (state.type === 'loading') {
      return []
    }

    return state.block.children.map((child) =>
      getFoldedChild(child, sideBarOpenedBlocksIdsSet, getFoldEvents)
    )
  }, [getFoldEvents, state, sideBarOpenedBlocksIdsSet])

  if (state.type === 'loading') {
    return <div>loading</div>
  }

  return (
    <StyledBlockContent>
      <div id='block__editor__anchor' />
      <UpDownList ignoreFocus={true} className='block__editor__nav'>
        <Scroller className='block__editor__nav__scroller'>
          {navTree.map((child) => (
            <BlockTree
              key={`nav-${child.id}`}
              root={child}
              active={currentBlock || doc.rootBlock}
              onSelect={setCurrentBlock}
              onDelete={actions.remove}
              idPrefix='nav'
              showFoldEvents={true}
            />
          ))}
        </Scroller>
        <div className='block__editor__nav--actions'>
          <NavigationItem
            labelClick={
              getFoldEvents('links', 'block__editor-actions', true).toggle
            }
            className='block__editor__nav--item'
            id='block__editor__nav--new-items'
            folded={!sideBarOpenedLinksIdsSet.has('block__editor-actions')}
            folding={getFoldEvents('links', 'block__editor-actions', true)}
            depth={0}
            label='New Blocks'
          />
          {sideBarOpenedLinksIdsSet.has('block__editor-actions') && (
            <>
              <NavigationItem
                labelClick={createContainer}
                className='block__editor__nav--item'
                id='block__editor__nav--container'
                depth={1}
                label={
                  <Flexbox alignItems='center' justifyContent='space-between'>
                    <span>Page</span>
                    <Icon path={mdiPlus} size={16} />
                  </Flexbox>
                }
                icon={{ type: 'icon', path: mdiPackageVariantClosed }}
              />
              <NavigationItem
                labelClick={createMarkdown}
                className='block__editor__nav--item'
                id='block__editor__nav--markdown'
                depth={1}
                label={
                  <Flexbox alignItems='center' justifyContent='space-between'>
                    <span>Markdown</span>
                    <Icon path={mdiPlus} size={16} />
                  </Flexbox>
                }
                icon={{ type: 'icon', path: mdiFileDocumentOutline }}
              />
              <NavigationItem
                labelClick={createTable}
                className='block__editor__nav--item'
                id='block__editor__nav--table'
                depth={1}
                label={
                  <Flexbox alignItems='center' justifyContent='space-between'>
                    <span>Table</span>
                    <Icon path={mdiPlus} size={16} />
                  </Flexbox>
                }
                icon={{ type: 'icon', path: mdiPackageVariantClosed }}
              />
              <NavigationItem
                labelClick={createEmbed}
                className='block__editor__nav--item'
                id='block__editor__nav--embed'
                depth={1}
                label={
                  <Flexbox alignItems='center' justifyContent='space-between'>
                    <span>Embed</span>
                    <Icon path={mdiPlus} size={16} />
                  </Flexbox>
                }
                icon={{ type: 'icon', path: mdiCodeTags }}
              />
            </>
          )}
        </div>
      </UpDownList>
      <div className='block__editor__view'>
        <Scroller
          className='block__editor__view__wrapper'
          id='block__editor__view__wrapper'
          ref={contentScrollerRef}
        >
          <BlockView
            isRootBlock={true}
            block={
              currentBlock ||
              (state.block.children.length > 0
                ? state.block.children[0]
                : state.block)
            }
            actions={actions}
            canvas={doc}
            realtime={provider}
            setCurrentBlock={setCurrentBlock}
            scrollToElement={scrollToElement}
            currentUserIsCoreMember={currentUserIsCoreMember}
          />
        </Scroller>
        <div id='block__editor__view__toolbar-portal' />
      </div>
    </StyledBlockContent>
  )
}

const StyledBlockContent = styled.div`
  display: flex;
  flex: 1 1 auto;
  overflow: hidden;

  & > .block__editor__nav {
    padding-top: ${({ theme }) => theme.sizes.spaces.df}px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${({ theme }) => theme.colors.border.main};
    width: 240px;
    flex: 0 0 auto;

    .block__editor__nav__scroller {
      flex-grow: 1;
    }
  }

  & .block__editor__view {
    flex: 1 1 auto;
    height: 100%;
    position: relative;
  }

  & .block__editor__view__wrapper {
    width: 100%;
    height: 100%;
    padding: ${({ theme }) => theme.sizes.spaces.md}px 0;
    position: relative;
  }
`

function getFoldedChild(
  targetBlock: Block,
  sideBarOpenedBlocksIdsSet: Set<string>,
  getFoldEvents: (
    type: CollapsableType,
    key: string,
    reversed?: boolean | undefined
  ) => FoldingProps
): Block & {
  folded?: boolean
  folding?: FoldingProps
} {
  if ((targetBlock.children || []).length === 0) {
    return targetBlock
  }

  return {
    ...targetBlock,
    folded: sideBarOpenedBlocksIdsSet.has(targetBlock.id),
    folding: getFoldEvents('blocks', targetBlock.id, true),
    children: targetBlock.children.map((child) =>
      getFoldedChild(child, sideBarOpenedBlocksIdsSet, getFoldEvents)
    ),
  } as any
}

export default BlockContent
