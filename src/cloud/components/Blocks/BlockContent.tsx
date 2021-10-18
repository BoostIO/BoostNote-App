import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react'
import { mdiPlus } from '@mdi/js'
import { Block, BlockCreateRequestBody, ContainerBlock } from '../../api/blocks'
import { useDocBlocks } from '../../lib/hooks/useDocBlocks'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { useModal } from '../../../design/lib/stores/modal'
import BlockTree from './BlockTree'
import styled from '../../../design/lib/styled'
import { find } from '../../../design/lib/utils/tree'
import useRealtime from '../../lib/editor/hooks/useRealtime'
import { BlockView } from './views'
import Scroller from '../../../design/components/atoms/Scroller'
import UpDownList from '../../../design/components/atoms/UpDownList'
import NavigationItem from '../../../design/components/molecules/Navigation/NavigationItem'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { usePage } from '../../lib/stores/pageStore'
import {
  CollapsableType,
  useSidebarCollapse,
} from '../../lib/stores/sidebarCollapse'
import { FoldingProps } from '../../../design/components/atoms/FoldingWrapper'
import { blockEventEmitter } from '../../lib/utils/events'
import { sleep } from '../../../lib/sleep'
import cc from 'classcat'
import { useRouter } from '../../lib/router'

export interface Canvas extends SerializedDocWithSupplemental {
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
  const { state, actions, sendingMap } = useDocBlocks(doc.rootBlock.id)
  const { closeAllModals } = useModal()
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null)
  const contentScrollerRef = useRef<OverlayScrollbarsComponent>(null)
  const [provider] = useRealtime({
    token: doc.collaborationToken || '',
    id: doc.id,
  })

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
      const res = await actions.create(block, doc.rootBlock)

      if (!res.err) {
        const block = res.data
        setCurrentBlock(block)
        await sleep(100) //rendering delay
        blockEventEmitter.dispatch({
          event: 'creation',
          blockType: block.type,
          blockId: block.id,
        })

        closeAllModals()
      }
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

  const createContainer = useCallback(() => {
    return createBlock({
      name: '',
      type: 'container',
      children: [],
      data: null,
    })
  }, [createBlock])

  const {
    sideBarOpenedBlocksIdsSet,
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

  const { state: routerState, hash } = useRouter()
  const docIsNew = !!routerState?.new
  const previousDocRef = useRef<{
    blockType: 'container' | 'markdown' | 'embed' | 'table' | 'github.issue'
    blockId: string
  }>()
  useEffect(() => {
    if (state.type === 'loading') {
      return
    }

    if (docIsNew && previousDocRef.current?.blockId !== state.block.id) {
      previousDocRef.current = {
        blockType: state.block.type,
        blockId: state.block.id,
      }
      if (
        state.block.children != null &&
        state.block.children.length > 0 &&
        state.block.children[0] != null
      ) {
        async function focusBlock({
          type,
          id,
        }: {
          type: 'container' | 'markdown' | 'embed' | 'table' | 'github.issue'
          id: string
        }) {
          await sleep(300).finally(() => {
            blockEventEmitter.dispatch({
              event: 'creation',
              blockType: type,
              blockId: id,
            })
          })
        }
        focusBlock(state.block.children[0])
      }
    }
  }, [state, docIsNew])

  const navDone = useRef(false)
  useEffect(() => {
    if (state.type === 'loaded' && !navDone.current) {
      const blockId = hash.slice(1)
      if (blockId !== '') {
        setCurrentBlock(find(state.block, (block) => block.id === blockId))
        navDone.current = true
      }
    }
  }, [state, hash])

  useEffect(() => {
    if (currentBlock != null) {
      window.location.hash = currentBlock.id
    }
  }, [currentBlock])

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
              sendingMap={sendingMap}
            />
          ))}
          <NavigationItem
            labelClick={createContainer}
            className='block__editor__nav--item'
            id='block__editor__nav--container'
            depth={1}
            label={'New Page'}
            icon={{ type: 'icon', path: mdiPlus }}
          />
        </Scroller>
      </UpDownList>
      <div className='block__editor__view'>
        <Scroller
          className={cc([
            'block__editor__view__wrapper',
            currentBlock != null &&
              currentBlock.type === 'embed' &&
              'block__editor__view__wrapper--padding-less',
          ])}
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
            sendingMap={sendingMap}
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

  .block__editor__view__wrapper--padding-less {
    padding: 0 !important;
  }

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
    width: 100%;
    overflow: hidden;
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
