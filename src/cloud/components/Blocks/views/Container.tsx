import React, { useState, useCallback } from 'react'
import { Block, ContainerBlock } from '../../../api/blocks'
import styled from '../../../../design/lib/styled'
import { ToggleBlockCreate } from '../BlockCreate'
import { BlockView, ViewProps } from '.'

const ContainerView = ({
  block,
  actions,
  canvas,
  isChild,
  realtime,
}: ViewProps<ContainerBlock>) => {
  const [addSelectOpen, setAddSelectOpen] = useState(false)

  const createBlock = useCallback(
    async (newBlock: Omit<Block, 'id'>) => {
      await actions.create(newBlock, block)
      setAddSelectOpen(false)
    },
    [block, actions]
  )

  return (
    <StyledContainerView className={isChild && 'block__view--nested'}>
      <h1>{canvas.rootBlock.id === block.id ? canvas.title : block.name}</h1>
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
            />
          )
        })}
      </div>
      {!isChild && (
        <ToggleBlockCreate
          open={addSelectOpen}
          onChange={setAddSelectOpen}
          onSubmit={createBlock}
        />
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
`

export default ContainerView
