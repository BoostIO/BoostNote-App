import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { BlockView, ViewProps } from './'
import { mdiGithub, mdiPlus, mdiPlusBoxOutline } from '@mdi/js'
import styled from '../../../../design/lib/styled'
import Icon from '../../../../design/components/atoms/Icon'
import { BlockCreateRequestBody, GithubIssueBlock } from '../../../api/blocks'
import { useBlockProps } from '../../../lib/hooks/useBlockProps'
import {
  getPropName,
  getPropType,
  makePropKey,
  PropKey,
  PropType,
} from '../../../lib/blocks/props'
import BlockProp from '../props'
import GitHubAssigneesData from '../data/GithubAssigneesData'
import GithubStatusData from '../data/GithubStatusData'
import GithubLabelsData from '../data/GithubLabelsData'
import { useModal } from '../../../../design/lib/stores/modal'
import DataTypeMenu from '../props/DataTypeMenu'
import { capitalize } from '../../../lib/utils/string'
import { getBlockDomId } from '../../../lib/blocks/dom'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import { ExternalLink } from '../../../../design/components/atoms/Link'
import BlockCreationModal from '../BlockCreationModal'
import BlockToolbar from '../BlockToolbar'
import EmbedForm from '../forms/EmbedForm'
import InfoBlock, {
  InfoBlockRow,
} from '../../../../design/components/organisms/InfoBlock'
import BlockLayout from '../BlockLayout'
import { getTableBlockInputId } from './Table'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import { markdownBlockEventEmitter } from '../../../lib/utils/events'
import Button from '../../../../design/components/atoms/Button'

const GithubIssueView = ({
  block,
  realtime,
  actions: blockActions,
  canvas,
  currentUserIsCoreMember,
  scrollToElement,
  setCurrentBlock,
}: ViewProps<GithubIssueBlock>) => {
  const [propsRecord, actions] = useBlockProps(block, realtime.doc)
  const { openContextModal, closeAllModals, openModal } = useModal()

  const prURL = block.data?.pull_request?.html_url || ''
  const htmlURLRegexes = useMemo(() => {
    const url = block.data.html_url || ''
    return {
      repoUrl: new RegExp(
        /(^https:\/\/github.com\/(?:([^\/]+)\/)+)(?:(?:issues|pull\/(?:[0-9]+)))$/,
        'gi'
      ).exec(url),
      isIssueURL: new RegExp(
        /^https:\/\/github.com\/([^\/]+\/)+issues\/([0-9]+)$/,
        'gi'
      ).test(url),
    }
  }, [block.data.html_url])

  const updateBlock = useCallback(
    async (data: GithubIssueBlock['data']) => {
      await blockActions.update({ ...block, data: { ...block.data, ...data } })
    },
    [blockActions, block]
  )

  const createPropRef = useRef((type: PropType) => {
    const count = Object.keys(propsRecord).reduce((acc, curr) => {
      return getPropType(curr as PropKey) === type ? acc + 1 : acc
    }, 0)
    const name = `${capitalize(type)}${count > 0 ? count : ''}`
    actions.set(makePropKey(name, type), '')
  })

  useEffect(() => {
    createPropRef.current = (type: PropType) => {
      const count = Object.keys(propsRecord).reduce((acc, curr) => {
        return getPropType(curr as PropKey) === type ? acc + 1 : acc
      }, 0)
      const name = `${capitalize(type)}${count > 0 ? count : ''}`
      actions.set(makePropKey(name, type), '')
    }
  }, [actions, propsRecord])

  const openPropAdd: React.MouseEventHandler = useCallback(
    async (ev) => {
      openContextModal(
        ev,
        <MetadataContainer>
          <DataTypeMenu
            onSelect={(type) => {
              createPropRef.current(type)
              closeAllModals()
            }}
          />
        </MetadataContainer>,
        { alignment: 'bottom-left' }
      )
    },
    [openContextModal, closeAllModals]
  )

  const props = useMemo(() => {
    return Object.entries(propsRecord) as [PropKey, string][]
  }, [propsRecord])

  const prUrl = useMemo(() => {
    return block.data?.pull_request?.html_url || ''
  }, [block.data])

  const createBlock = useCallback(
    async (newBlock: BlockCreateRequestBody) => {
      const createdBlock = await blockActions.create(newBlock, block)
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
    [blockActions, block, closeAllModals, scrollToElement]
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
    <StyledGithubIssueView id={getBlockDomId(block)}>
      <BlockLayout>
        <Flexbox alignItems='center' className='github-issue__view__title'>
          <Icon path={mdiGithub} size={26} />
          <h1>{block.data.title}</h1>
        </Flexbox>
        <InfoBlock className='github-issue__view__info'>
          {htmlURLRegexes.repoUrl != null && (
            <InfoBlockRow label='Repository'>
              <ExternalLink href={htmlURLRegexes.repoUrl[1]} showIcon={true}>
                {htmlURLRegexes.repoUrl[2]}
              </ExternalLink>
            </InfoBlockRow>
          )}
          {htmlURLRegexes.isIssueURL && (
            <InfoBlockRow label='Issue number'>
              <ExternalLink href={block.data.html_url || ''} showIcon={true}>
                #{block.data.number}
              </ExternalLink>
            </InfoBlockRow>
          )}
          {prURL !== '' && (
            <InfoBlockRow label='Linked PR'>
              <ExternalLink href={prUrl} showIcon={true}>
                #{block.data.pull_request.number || block.data.number}
              </ExternalLink>
            </InfoBlockRow>
          )}
          <InfoBlockRow label='Assignees'>
            <GitHubAssigneesData data={block.data} onUpdate={updateBlock} />
          </InfoBlockRow>
          <InfoBlockRow label='Status'>
            <GithubStatusData data={block.data} onUpdate={updateBlock} />
          </InfoBlockRow>
          <InfoBlockRow label='Labels'>
            <GithubLabelsData data={block.data} onUpdate={updateBlock} />
          </InfoBlockRow>
          {props.map(([key, value]) => {
            return (
              <InfoBlockRow label={getPropName(key)} key={`custom-${key}`}>
                <BlockProp
                  currentUserIsCoreMember={currentUserIsCoreMember}
                  type={getPropType(key)}
                  value={value}
                  onChange={(newValue) => actions.set(key, newValue)}
                />
              </InfoBlockRow>
            )
          })}
          <div className='info__block__row'>
            <Button
              variant='secondary'
              iconPath={mdiPlus}
              iconSize={16}
              onClick={(ev) => openPropAdd(ev)}
            >
              Add Prop
            </Button>
          </div>
        </InfoBlock>
      </BlockLayout>
      <div className='github-issue__view__children'>
        {block.children.map((child) => {
          return (
            <BlockView
              key={child.id}
              block={child}
              actions={blockActions}
              isChild={true}
              canvas={canvas}
              realtime={realtime}
              setCurrentBlock={setCurrentBlock}
              scrollToElement={scrollToElement}
              currentUserIsCoreMember={currentUserIsCoreMember}
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
    </StyledGithubIssueView>
  )
}

const StyledGithubIssueView = styled.div`
  h1 {
    margin: 0;
  }

  .github-issue__view__title .icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .block__layout + .block__layout {
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .github-issue__view__info {
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;

    .text-cell__controls {
      right: initial;
      left: 100%;
    }
  }
`

export default GithubIssueView
