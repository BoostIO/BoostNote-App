import React, { useState, useCallback, ChangeEvent } from 'react'
import CustomButton from '../atoms/buttons/CustomButton'
import Flexbox from '../atoms/Flexbox'
import styled from '../../lib/styled'
import SettingInput from '../../../shared/components/organisms/Settings/atoms/SettingInput'

interface TokenCreateProps {
  onCreate: (name: string) => void
}

const TokenCreate = ({ onCreate }: TokenCreateProps) => {
  const [name, setName] = useState('')

  const create = useCallback(() => {
    onCreate(name)
  }, [name, onCreate])

  return (
    <StyledTokenCreate>
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
        {name.length === 0 && (
          <StyledWarningText>Enter a name</StyledWarningText>
        )}
        <CustomButton disabled={name.length === 0} onClick={create}>
          Create
        </CustomButton>
      </Flexbox>
    </StyledTokenCreate>
  )
}

export default TokenCreate

const StyledTokenCreate = styled.div`
  width: 100%;
`

const StyledWarningText = styled.small`
  margin-right: ${({ theme }) => theme.space.xsmall}px;
  color: ${({ theme }) => theme.warningTextColor};
`
