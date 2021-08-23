import React, {
  useState,
  useCallback,
  ChangeEvent,
  useRef,
  useEffect,
} from 'react'
import { SerializedApiToken } from '../interfaces/db/apiTokens'
import {
  mdiDeleteOutline,
  mdiPencil,
  mdiClose,
  mdiContentCopy,
  mdiCheck,
} from '@mdi/js'
import copy from 'copy-to-clipboard'
import { useI18n } from '../lib/hooks/useI18n'
import { lngKeys } from '../lib/i18n/types'
import Button from '../../design/components/atoms/Button'
import styled from '../../design/lib/styled'
import FormInput from '../../design/components/molecules/Form/atoms/FormInput'
import WithTooltip from '../../design/components/atoms/WithTooltip'
import Flexbox from '../../design/components/atoms/Flexbox'

interface TokenControlProps {
  token: SerializedApiToken
  onUpdate: (token: SerializedApiToken) => void
  onDelete: (token: SerializedApiToken) => void
}

const TokenControl = ({ token, onUpdate, onDelete }: TokenControlProps) => {
  const [name, setName] = useState(token.name)
  const [hide, setHide] = useState(true)
  const [edit, setEdit] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [clipIcon, setClipIcon] = useState<string>(mdiContentCopy)
  const { translate } = useI18n()

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
            <FormInput
              ref={inputRef}
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
            <div>
              <Button
                size='sm'
                variant='transparent'
                onClick={() => setEdit(false)}
                iconPath={mdiClose}
                iconSize={16}
              />
              <Button size='sm' onClick={onSave}>
                {translate(lngKeys.GeneralSaveVerb)}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p style={{ marginTop: 0 }}>{name}</p>
            <div>
              <Button
                size='sm'
                variant='transparent'
                onClick={() => setEdit(true)}
                iconPath={mdiPencil}
                iconSize={16}
              />
              <Button
                size='sm'
                variant='transparent'
                onClick={() => onDelete(token)}
                iconPath={mdiDeleteOutline}
                iconSize={16}
              />
            </div>
          </>
        )}
      </Flexbox>
      <Flexbox
        justifyContent='space-between'
        alignItems='center'
        style={{ height: 26 }}
      >
        <span style={{ flex: ' 0 0 auto' }}>
          {translate(lngKeys.GeneralToken)}:
        </span>
        <Flexbox flex='1 1 auto' style={{ margin: '0 15px', height: '100%' }}>
          <FormInput readOnly={true} value={displayContent} />
          <WithTooltip tooltip={translate(lngKeys.GeneralCopyVerb)}>
            <Button
              variant='icon'
              className='copy-button'
              onClick={copyButtonHandler}
              tabIndex={0}
              iconPath={clipIcon}
              iconSize={16}
            />
          </WithTooltip>
        </Flexbox>
        <Button
          className='control-button'
          variant='bordered'
          onClick={() => setHide(!hide)}
        >
          {hide
            ? translate(lngKeys.GeneralShowVerb)
            : translate(lngKeys.GeneralHideVerb)}
        </Button>
      </Flexbox>
    </StyledTokenControl>
  )
}

export default TokenControl

const StyledTokenControl = styled.div`
  width: 100%;

  .control-button {
    lineheight: normal;
    padding: 0 8px;
    height: 100%;
    width: 70px;
    flex: 0 0 auto;
  }

  & > div:first-child {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`
