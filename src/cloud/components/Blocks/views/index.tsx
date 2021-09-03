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
  block: T
  actions: BlockActions
  canvas: Canvas
  realtime: WebsocketProvider
  isChild?: boolean
}
export const BlockView = ({
  block,
  actions,
  canvas,
  realtime,
  isChild,
}: ViewProps<Block>) => {
  switch (block.type) {
    case 'container':
      return (
        <Container
          block={block}
          actions={actions}
          isChild={isChild}
          canvas={canvas}
          realtime={realtime}
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
