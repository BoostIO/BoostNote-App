import React from 'react'
import { WebsocketProvider } from 'y-websocket'
import { Block } from '../../../api/blocks'
import { BlockActions } from '../../../lib/hooks/useDocBlocks'
import Markdown from './Markdown'
import { Canvas } from '../BlockContent'
import Container from './Container'
import Embed from './Embed'
import Table from './Table'
import GithubIssueView from './GithubIssue'

export interface ViewProps<T extends Block> {
  isRootBlock?: boolean
  block: T
  actions: BlockActions
  canvas: Canvas
  realtime: WebsocketProvider
  isChild?: boolean
  setCurrentBlock: React.Dispatch<React.SetStateAction<Block | null>>
  scrollToElement: (elem: HTMLElement | null) => void
  currentUserIsCoreMember: boolean
  sendingMap: Map<string, string>
}
export const BlockView = ({
  isRootBlock,
  block,
  actions,
  canvas,
  realtime,
  isChild,
  currentUserIsCoreMember,
  sendingMap,
  scrollToElement,
  setCurrentBlock,
}: ViewProps<Block>) => {
  switch (block.type) {
    case 'container':
      return (
        <Container
          isRootBlock={isRootBlock}
          block={block}
          actions={actions}
          isChild={isChild}
          canvas={canvas}
          realtime={realtime}
          setCurrentBlock={setCurrentBlock}
          scrollToElement={scrollToElement}
          currentUserIsCoreMember={currentUserIsCoreMember}
          sendingMap={sendingMap}
        />
      )
    case 'embed':
      return (
        <Embed
          block={block}
          actions={actions}
          isChild={isChild}
          canvas={canvas}
          realtime={realtime}
          setCurrentBlock={setCurrentBlock}
          scrollToElement={scrollToElement}
          currentUserIsCoreMember={currentUserIsCoreMember}
          sendingMap={sendingMap}
        />
      )
    case 'markdown':
      return (
        <Markdown
          block={block}
          actions={actions}
          isChild={isChild}
          canvas={canvas}
          realtime={realtime}
          setCurrentBlock={setCurrentBlock}
          scrollToElement={scrollToElement}
          currentUserIsCoreMember={currentUserIsCoreMember}
          sendingMap={sendingMap}
        />
      )
    case 'table':
      return (
        <Table
          block={block}
          actions={actions}
          isChild={isChild}
          canvas={canvas}
          realtime={realtime}
          setCurrentBlock={setCurrentBlock}
          scrollToElement={scrollToElement}
          currentUserIsCoreMember={currentUserIsCoreMember}
          sendingMap={sendingMap}
        />
      )
    case 'github.issue':
      return (
        <GithubIssueView
          block={block}
          actions={actions}
          isChild={isChild}
          canvas={canvas}
          realtime={realtime}
          setCurrentBlock={setCurrentBlock}
          scrollToElement={scrollToElement}
          currentUserIsCoreMember={currentUserIsCoreMember}
          sendingMap={sendingMap}
        />
      )
    default:
      return (
        <div>
          Block of type ${(block as any).type || 'unknown'} is unsupported
        </div>
      )
  }
}
