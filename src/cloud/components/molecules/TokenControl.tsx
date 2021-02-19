import React, {
  useState,
  useCallback,
  ChangeEvent,
  useRef,
  useEffect,
} from 'react'
import { SerializedApiToken } from '../../interfaces/db/apiTokens'
import IconMdi from '../atoms/IconMdi'
import {
  mdiDeleteOutline,
  mdiPencil,
  mdiClose,
  mdiContentCopy,
  mdiCheck,
} from '@mdi/js'
import Flexbox from '../atoms/Flexbox'
import styled from '../../lib/styled'
import SmallButton from '../atoms/SmallButton'
import {
  inputStyle,
  borderedInputStyle,
  baseIconStyle,
} from '../../lib/styled/styleFunctions'
import copy from 'copy-to-clipboard'
import CustomButton from '../atoms/buttons/CustomButton'
import Tooltip from '../atoms/Tooltip'

interface TokenControlProps {
  token: SerializedApiToken
  onUpdate: (token: SerializedApiToken) => void
  onDelete: (token: SerializedApiToken) => void
}

const TokenControl = ({ token, onUpdate, onDelete }: TokenControlProps) => {
  const [name, setName] = useState(token.name)
  const [hide, setHide] = useState(true)
  const [edit, setEdit] = useState(false)
  const inputRef = useRef<HTMLInputElement>()
  const [clipIcon, setClipIcon] = useState<string>(mdiContentCopy)

  const copyButtonHandler = () => {
    copy(token.token)
    setClipIcon(mdiCheck)
    setTimeout(() => {
      setClipIcon(mdiContentCopy)
    }, 600)
  }

  const onSave = useCallback(() => {
    onUpdate({ ...token, name })
    setEdit(false)
  }, [name, onUpdate, token])

  useEffect(() => {
    if (inputRef.current != null && edit) {
      inputRef.current.focus()
    }
  }, [edit])

  const displayContent = hide ? '*'.repeat(token.token.length) : token.token

  return (
    <StyledTokenControl>
      <Flexbox justifyContent='space-between'>
        {edit ? (
          <>
            <StyleNameInput
              ref={inputRef}
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
            <div>
              <SmallButton variant='transparent' onClick={() => setEdit(false)}>
                <IconMdi path={mdiClose} size={18} />
              </SmallButton>
              <SmallButton onClick={onSave}>Save</SmallButton>
            </div>
          </>
        ) : (
          <>
            <p>{name}</p>
            <div>
              <SmallButton variant='transparent' onClick={() => setEdit(true)}>
                <IconMdi path={mdiPencil} size={18} />
              </SmallButton>
              <SmallButton
                variant='transparent'
                onClick={() => onDelete(token)}
              >
                <IconMdi path={mdiDeleteOutline} size={18} />
              </SmallButton>
            </div>
          </>
        )}
      </Flexbox>
      <Flexbox
        justifyContent='space-between'
        alignItems='center'
        style={{ height: 26 }}
      >
        <span style={{ flex: ' 0 0 auto' }}>Token:</span>
        <Flexbox flex='1 1 auto' style={{ margin: '0 15px', height: '100%' }}>
          <StyledReadOnlyInput readOnly={true} value={displayContent} />
          <Tooltip tooltip='copy'>
            <StyledClipboardButton
              className='copy-button'
              onClick={copyButtonHandler}
              tabIndex={0}
            >
              <IconMdi path={clipIcon} size={14} />
            </StyledClipboardButton>
          </Tooltip>
        </Flexbox>
        <CustomButton
          variant='inverse-secondary'
          onClick={() => setHide(!hide)}
          style={{
            lineHeight: 'normal',
            padding: '0 8px',
            height: '100%',
            width: '70px',
            flex: '0 0 auto',
          }}
        >
          {hide ? 'Show' : 'Hide'}
        </CustomButton>
      </Flexbox>
    </StyledTokenControl>
  )
}

export default TokenControl

const StyledTokenControl = styled.div`
  width: 100%;

  & > div:first-child {
    margin-bottom: ${({ theme }) => theme.space.xsmall}px;
  }
`

const StyleNameInput = styled.input`
  ${inputStyle}
`

const StyledReadOnlyInput = styled.input`
  ${borderedInputStyle}
  padding: 0 4px;
  flex: 1 1 auto;
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  height: 100%;
`

const StyledClipboardButton = styled.button`
  flex: 0 0 auto;
  background: none;
  ${baseIconStyle}
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  height: 100%;
  font-size: inherit;
  line-height: inherit;
`
