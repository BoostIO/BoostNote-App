import React, { useState, useCallback, ChangeEvent } from 'react'
import styled from '../../../../lib/styled'
import Button from '../../../atoms/Button'
import Flexbox from '../../../atoms/Flexbox'
import SettingInput from './SettingInput'

interface SettingTokenCreateProps {
  onCreate: (name: string) => void
}

const SettingTokenCreate = ({ onCreate }: SettingTokenCreateProps) => {
  const [name, setName] = useState('')

  const create = useCallback(() => {
    onCreate(name)
  }, [name, onCreate])

  return (
    <Container className='setting__token-create'>
      <h2>Create a token</h2>
      <section>
        <SettingInput
          label={'Name'}
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        ></SettingInput>
      </section>
      <Flexbox justifyContent='flex-end'>
        {name.length === 0 && <p className='text--warning'>Enter a name</p>}
        <Button disabled={name.length === 0} onClick={create}>
          Create
        </Button>
      </Flexbox>
    </Container>
  )
}

export default SettingTokenCreate

const Container = styled.div`
  width: 100%;

  .text--warning {
    margin-top: 0;
    margin-right: ${({ theme }) => theme.sizes.spaces.df}px;
    color: ${({ theme }) => theme.colors.variants.warning.base};
  }
`
