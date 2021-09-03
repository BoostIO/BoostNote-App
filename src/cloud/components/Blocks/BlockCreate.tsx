import {
  mdiCodeTags,
  mdiFileDocumentOutline,
  mdiPlusBoxOutline,
  mdiTable,
} from '@mdi/js'
import React, { useCallback, useEffect, useRef } from 'react'
import Icon from '../../../design/components/atoms/Icon'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { Block } from '../../api/blocks'
import { FormProps } from './BlockContent'
import EmbedForm from './forms/EmbedForm'
import MarkdownForm from './forms/MarkdownForm'
import TableForm from './forms/TableForm'

const modalOptions = {
  showCloseIcon: true,
  width: 'small' as const,
  title: 'Create new block',
}

const BlockCreate = ({ onSubmit }: FormProps<Block>) => {
  const { openModal, closeAllModals } = useModal()

  const onSubmitRef: React.MutableRefObject<typeof onSubmit> = useRef(
    async (block) => {
      await onSubmit(block)
      closeAllModals()
    }
  )
  useEffect(() => {
    onSubmitRef.current = async (block) => {
      await onSubmit(block)
      closeAllModals()
    }
  }, [onSubmit, closeAllModals])

  const createMarkdown = useCallback(() => {
    openModal(<MarkdownForm onSubmit={callRef(onSubmitRef)} />, modalOptions)
  }, [openModal])

  const createTable = useCallback(() => {
    openModal(<TableForm onSubmit={callRef(onSubmitRef)} />, modalOptions)
  }, [openModal])

  const createEmbed = useCallback(() => {
    openModal(<EmbedForm onSubmit={callRef(onSubmitRef)} />, modalOptions)
  }, [openModal])

  return (
    <BlockCreateContainer>
      <h3>Select a block</h3>
      <div>
        <div onClick={createMarkdown} className='block__view__add__selector'>
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
    </BlockCreateContainer>
  )
}

export const ToggleBlockCreate = ({
  onSubmit,
  open,
  onChange,
}: FormProps<Block> & {
  open: boolean
  onChange: (open: boolean) => void
}) => {
  return (
    <>
      <ToggleBlockCreateContainer onClick={() => onChange(!open)}>
        <Icon path={mdiPlusBoxOutline} size={16} />
        <span>Add Block</span>
      </ToggleBlockCreateContainer>
      {open && <BlockCreate onSubmit={onSubmit} />}
    </>
  )
}

const BlockCreateContainer = styled.div`
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
`

const ToggleBlockCreateContainer = styled.div`
  display: flex;
  justify-content: center;
  cursor: pointer;

  border: 1px solid ${({ theme }) => theme.colors.border.main};
  padding: ${({ theme }) => theme.sizes.spaces.df}px;
  & span {
    margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

function callRef<T, U>(
  ref: React.MutableRefObject<(...args: T[]) => U>
): (...args: T[]) => U {
  return (...args) => ref.current(...args)
}

export default BlockCreate
