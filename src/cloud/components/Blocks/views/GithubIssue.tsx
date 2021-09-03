import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BlockView, ViewProps } from './'
import { mdiLink } from '@mdi/js'
import styled from '../../../../design/lib/styled'
import Icon from '../../../../design/components/atoms/Icon'
import { Block, GithubIssueBlock } from '../../../api/blocks'
import { useBlockProps } from '../../../lib/hooks/useBlockProps'
import {
  getPropName,
  getPropType,
  makePropKey,
  PropKey,
  PropType,
} from '../../../lib/blocks/props'
import BlockProp from '../props'
import HyperlinkProp from '../props/HyperlinkProp'
import GitHubAssigneesData from '../data/GithubAssigneesData'
import GithubStatusData from '../data/GithubStatusData'
import GithubLabelsData from '../data/GithubLabelsData'
import Button from '../../../../design/components/atoms/Button'
import { useModal } from '../../../../design/lib/stores/modal'
import DataTypeMenu from '../props/DataTypeMenu'
import { capitalize } from '../../../lib/utils/string'
import { ToggleBlockCreate } from '../BlockCreate'

const GithubIssueView = ({
  block,
  realtime,
  actions: blockActions,
  canvas,
}: ViewProps<GithubIssueBlock>) => {
  const [propsRecord, actions] = useBlockProps(block, realtime.doc)
  const { openContextModal, closeAllModals } = useModal()
  const [blockSelectOpen, setBlockSelectOpen] = useState(false)

  const updateBlock = useCallback(
    async (data: GithubIssueBlock['data']) => {
      await blockActions.update({ ...block, data: { ...block.data, ...data } })
    },
    [blockActions, block]
  )

  const createBlock = useCallback(
    async (newBlock: Omit<Block, 'id'>) => {
      await blockActions.create(newBlock, block)
      setBlockSelectOpen(false)
    },
    [block, blockActions]
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
        <div>
          <DataTypeMenu
            onSelect={(type) => {
              createPropRef.current(type)
              closeAllModals()
            }}
          />
        </div>
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

  return (
    <StyledGithubIssueView>
      <h1>{block.data.title}</h1>
      <div className='github-issue__view__info'>
        <div>
          <div>Issue number</div>
          <div>
            <a href={block.data.html_url}>
              <div>
                <span>#{block.data.number}</span>
                <Icon path={mdiLink} />
              </div>
            </a>
          </div>
        </div>
        <div>
          <div>Assignees</div>
          <div>
            <GitHubAssigneesData data={block.data} onUpdate={updateBlock} />
          </div>
        </div>
        <div>
          <div>Status</div>
          <div>
            <GithubStatusData data={block.data} onUpdate={updateBlock} />
          </div>
        </div>
        <div>
          <div>Labels</div>
          <div>
            <GithubLabelsData data={block.data} onUpdate={updateBlock} />
          </div>
        </div>
        <div>
          <div>Linked PR</div>
          <div>
            <HyperlinkProp href={prUrl} label={getPRNumFromUrl(prUrl)} />
          </div>
        </div>

        {props.map(([key, value]) => {
          return (
            <div key={key}>
              <div>{getPropName(key)}</div>
              <div>
                <BlockProp
                  type={getPropType(key)}
                  value={value}
                  onChange={(newValue) => actions.set(key, newValue)}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div>
        <Button onClick={openPropAdd}>+ Add Prop</Button>
      </div>
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
            />
          )
        })}
      </div>
      <ToggleBlockCreate
        open={blockSelectOpen}
        onChange={setBlockSelectOpen}
        onSubmit={createBlock}
      />
    </StyledGithubIssueView>
  )
}

const StyledGithubIssueView = styled.div`
  .github-issue__view__info {
    & > div {
      display: flex;
      align-items: center;
      padding: ${({ theme }) => theme.sizes.spaces.sm}px 0;
      & > div:first-child {
        color: ${({ theme }) => theme.colors.text.subtle};
      }

      & > div {
        min-width: 100px;
      }
    }

    & a {
      color: ${({ theme }) => theme.colors.text.primary};
      text-decoration: none;
    }
  }

  .github-issue__view__children > * {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.md}px;
  }
`

function getPRNumFromUrl(url: string) {
  const num = url.split('/').pop()
  return num != null && num !== '' ? `#${num}` : url
}

export default GithubIssueView
