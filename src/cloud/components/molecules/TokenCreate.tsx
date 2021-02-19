import React, { useState, useCallback, ChangeEvent } from 'react'
import CustomButton from '../atoms/buttons/CustomButton'
import {
  Section,
  SectionInput,
  SectionLabel,
} from '../organisms/settings/styled'
import Flexbox from '../atoms/Flexbox'
import styled from '../../lib/styled'
import { SectionHeader2 } from '../organisms/Modal/contents/styled'

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
      <SectionHeader2 style={{ margin: '0' }}>Create a token</SectionHeader2>
      <Section>
        <SectionLabel>Name</SectionLabel>
        <SectionInput
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        />
      </Section>
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
