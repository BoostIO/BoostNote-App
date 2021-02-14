import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { SerializedDocWithBookmark } from '../../interfaces/db/doc'
import { useNav } from '../../lib/stores/nav'
import { usePage } from '../../lib/stores/pageStore'
import { useToast } from '../../lib/stores/toast'
import {
  createShareLink,
  deleteShareLink,
  regenerateShareLink,
  updateShareLink,
} from '../../api/share'
import Switch from 'react-switch'
import {
  mdiChevronDown,
  mdiChevronRight,
  mdiLinkPlus,
  mdiOpenInNew,
  mdiClipboardTextOutline,
  mdiLinkVariant,
  mdiClipboardCheckOutline,
} from '@mdi/js'
import Icon from '../atoms/Icon'
import copy from 'copy-to-clipboard'
import styled from '../../lib/styled'
import {
  borderedInputStyle,
  baseIconStyle,
  secondaryButtonStyle,
  inverseSecondaryButtonStyle,
  inputStyle,
  primaryButtonStyle,
} from '../../lib/styled/styleFunctions'
import Flexbox from '../atoms/Flexbox'
import { Spinner } from '../atoms/Spinner'
import DatePicker from 'react-datepicker'
import { isArray } from 'util'
import 'react-datepicker/dist/react-datepicker.css'
import { useSettings } from '../../lib/stores/settings'
import IconMdi from '../atoms/IconMdi'
import { boostHubBaseUrl } from '../../lib/consts'
import { SerializedTeam } from '../../interfaces/db/team'
import { getDocLinkHref } from '../atoms/Link/DocLink'
import { usingElectron, openInBrowser } from '../../lib/stores/electron'

interface DocShareProps {
  currentDoc: SerializedDocWithBookmark
  team: SerializedTeam
}

type SendingState =
  | 'idle'
  | 'toggling'
  | 'regenerating'
  | 'password'
  | 'expireDate'

const DocShare = ({ currentDoc, team }: DocShareProps) => {
  const [sending, setSending] = useState<SendingState>('idle')
  const { updateDocsMap } = useNav()
  const { setPartialPageData, subscription } = usePage()
  const { pushMessage } = useToast()
  const [showSettings, setShowSettings] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showExpireForm, setShowExpireForm] = useState(false)
  const [passwordText, setPasswordText] = useState('')
  const [expireDate, setExpireDate] = useState<Date | null>(null)
  const { openSettingsTab } = useSettings()

  useEffect(() => {
    if (currentDoc.shareLink == null) {
      setPasswordText('')
      setExpireDate(null)
      return
    }

    setPasswordText(currentDoc.shareLink.password || '')
    setExpireDate(
      currentDoc.shareLink.expireAt != null
        ? new Date(currentDoc.shareLink.expireAt)
        : null
    )
  }, [currentDoc.shareLink])

  const sharedLinkHref = useMemo(() => {
    if (currentDoc.shareLink == null) {
      return ''
    }
    return `${boostHubBaseUrl}/shared/${currentDoc.shareLink.id}`
  }, [currentDoc.shareLink])

  const updatePasswordText: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setPasswordText(event.target.value)
    },
    []
  )

  const copyButtonHandler = useCallback(() => {
    copy(sharedLinkHref)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 600)
  }, [sharedLinkHref])

  const togglePublicSharing = useCallback(async () => {
    if (sending !== 'idle') {
      return
    }
    setSending('toggling')
    try {
      const updatedDoc = { ...currentDoc }
      if (currentDoc.shareLink == null) {
        const { link } = await createShareLink(currentDoc)
        updatedDoc.shareLink = link
      } else {
        await deleteShareLink(currentDoc.shareLink)
        updatedDoc.shareLink = undefined
      }

      updateDocsMap([currentDoc.id, updatedDoc])
      setPartialPageData({ pageDoc: updatedDoc })
      setShowSettings(updatedDoc.shareLink != null)
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: 'Could not publicly share this doc',
      })
    }
    setSending('idle')
  }, [
    currentDoc,
    setPartialPageData,
    setSending,
    sending,
    pushMessage,
    updateDocsMap,
  ])

  const regenerateCallback = useCallback(async () => {
    if (currentDoc.shareLink == null || sending !== 'idle') {
      return
    }

    setSending('regenerating')
    try {
      const { link } = await regenerateShareLink(currentDoc.shareLink)

      const updatedDoc = { ...currentDoc, shareLink: link }

      updateDocsMap([currentDoc.id, updatedDoc])
      setPartialPageData({ pageDoc: updatedDoc })
    } catch {
      pushMessage({
        title: 'Error',
        description: 'Could not regenerate share link',
      })
    }
    setSending('idle')
  }, [currentDoc, setPartialPageData, sending, pushMessage, updateDocsMap])

  const togglePassword = useCallback(
    async (changedValue: boolean) => {
      if (currentDoc.shareLink == null) {
        return
      }

      if (changedValue) {
        setShowPasswordForm(true)
        return
      }

      if (currentDoc.shareLink.password != null) {
        setSending('password')
        try {
          const { link } = await updateShareLink(currentDoc.shareLink, {
            password: false,
          })
          const updatedDoc = { ...currentDoc, shareLink: link }
          updateDocsMap([currentDoc.id, updatedDoc])
          setPartialPageData({ pageDoc: updatedDoc })
          setShowPasswordForm(false)
        } catch {
          pushMessage({
            title: 'Error',
            description: 'Could not update the password',
          })
        }
        setSending('idle')
      }
    },
    [currentDoc, pushMessage, updateDocsMap, setPartialPageData]
  )

  const toggleExpire = useCallback(
    async (changedValue: boolean) => {
      if (currentDoc.shareLink == null) {
        return
      }

      if (changedValue) {
        setShowExpireForm(true)
        return
      }

      if (currentDoc.shareLink.expireAt != null) {
        setSending('expireDate')
        try {
          const { link } = await updateShareLink(currentDoc.shareLink, {
            expireAt: false,
          })
          const updatedDoc = { ...currentDoc, shareLink: link }
          updateDocsMap([currentDoc.id, updatedDoc])
          setPartialPageData({ pageDoc: updatedDoc })
          setShowExpireForm(false)
        } catch {
          pushMessage({
            title: 'Error',
            description: 'Could not update the expiration date',
          })
        }
        setSending('idle')
      }
    },
    [currentDoc, pushMessage, updateDocsMap, setPartialPageData]
  )

  const onSubmitPassword = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()

      if (
        sending !== 'idle' ||
        subscription == null ||
        currentDoc.shareLink == null ||
        passwordText.trim() === ''
      ) {
        return
      }

      setSending('password')
      try {
        const { link } = await updateShareLink(currentDoc.shareLink, {
          password: passwordText.trim(),
        })
        const updatedDoc = { ...currentDoc, shareLink: link }
        updateDocsMap([currentDoc.id, updatedDoc])
        setPartialPageData({ pageDoc: updatedDoc })
      } catch {
        pushMessage({
          title: 'Error',
          description: 'Could not update the password',
        })
      }
      setSending('idle')
    },

    [
      sending,
      subscription,
      currentDoc,
      passwordText,
      pushMessage,
      updateDocsMap,
      setPartialPageData,
    ]
  )

  const onSubmitExpire = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()

      if (
        sending !== 'idle' ||
        subscription == null ||
        currentDoc.shareLink == null ||
        expireDate == null
      ) {
        return
      }

      setSending('expireDate')
      try {
        const { link } = await updateShareLink(currentDoc.shareLink, {
          expireAt: expireDate.toString(),
        })
        const updatedDoc = { ...currentDoc, shareLink: link }
        updateDocsMap([currentDoc.id, updatedDoc])
        setPartialPageData({ pageDoc: updatedDoc })
      } catch {
        pushMessage({
          title: 'Error',
          description: 'Could not update the expiration date',
        })
      }
      setSending('idle')
    },

    [
      sending,
      subscription,
      currentDoc,
      expireDate,
      pushMessage,
      updateDocsMap,
      setPartialPageData,
    ]
  )

  const shareLink = currentDoc.shareLink

  const docUrl = `${boostHubBaseUrl}${getDocLinkHref(
    currentDoc,
    team,
    'index'
  )}`

  const [docUrlCopied, setDocUrlCopied] = useState(false)

  const copyDocUrl = useCallback(() => {
    copy(docUrl)
    setDocUrlCopied(true)
    setTimeout(() => {
      setDocUrlCopied(false)
    }, 600)
  }, [docUrl])

  const openNew = useCallback(() => {
    openInBrowser(docUrl)
  }, [docUrl])

  return (
    <>
      {usingElectron && (
        <>
          <Container className='context__column'>
            <Flexbox className='share__row'>
              <label className='share__row__label'>
                <IconMdi
                  path={mdiLinkVariant}
                  size={18}
                  className='context__icon'
                />
                URL
              </label>
            </Flexbox>
            <Flexbox className='share__row'>
              <input
                readOnly={true}
                className='share__link__input'
                value={docUrl}
                tabIndex={-1}
              />
              <button
                onClick={copyDocUrl}
                tabIndex={0}
                className='share__link__copy'
              >
                <IconMdi
                  path={
                    docUrlCopied
                      ? mdiClipboardCheckOutline
                      : mdiClipboardTextOutline
                  }
                  size={16}
                />
              </button>
              <button
                onClick={openNew}
                tabIndex={0}
                className='share__link__copy'
              >
                <IconMdi path={mdiOpenInNew} size={16} />
              </button>
            </Flexbox>
          </Container>
          <div className='context__break' />
        </>
      )}
      <Container className='context__column'>
        <Flexbox className='share__row'>
          <label className='share__row__label'>
            <IconMdi path={mdiLinkPlus} size={18} className='context__icon' />
            Public Sharing
          </label>
          <div className='share__row__switch'>
            <Switch
              disabled={sending !== 'idle'}
              type='switch'
              id='shared-custom-switch'
              onChange={togglePublicSharing}
              checked={shareLink != null}
              uncheckedIcon={false}
              checkedIcon={false}
              height={20}
              width={45}
              onColor='#5580DC'
            />
          </div>
        </Flexbox>

        {shareLink != null && (
          <>
            <Flexbox className='share__row'>
              <input
                readOnly={true}
                className='share__link__input'
                value={sharedLinkHref}
                tabIndex={-1}
              />
              <button
                onClick={copyButtonHandler}
                tabIndex={0}
                id='share__link__copy'
              >
                <IconMdi
                  path={
                    copied ? mdiClipboardCheckOutline : mdiClipboardTextOutline
                  }
                  size={16}
                />
              </button>
            </Flexbox>
            <button
              className='share__row'
              id='settings__share__link'
              onClick={() => setShowSettings((prev) => !prev)}
            >
              <Icon path={showSettings ? mdiChevronDown : mdiChevronRight} />{' '}
              Sharing settings
            </button>
            {showSettings && (
              <>
                <Flexbox justifyContent='space-between' className='share__row'>
                  <Flexbox flex='1 1 auto' wrap='wrap'>
                    Regenerate Link
                  </Flexbox>
                  <button
                    disabled={sending != 'idle'}
                    id='regenerate__share__link'
                    onClick={regenerateCallback}
                  >
                    {sending === 'regenerating' ? (
                      <Spinner className='relative' />
                    ) : (
                      'Regenerate'
                    )}
                  </button>
                </Flexbox>
                <Flexbox justifyContent='space-between' className='share__row'>
                  <Flexbox
                    flex='1 1 auto'
                    wrap='wrap'
                    className='share__row__label'
                  >
                    <span>Password Protect</span>
                    {subscription == null && (
                      <button
                        tabIndex={-1}
                        className='upgrade__badge'
                        onClick={() => openSettingsTab('teamUpgrade')}
                      >
                        upgrade
                      </button>
                    )}
                  </Flexbox>
                  <div className='share__row__switch'>
                    <Switch
                      disabled={subscription == null || sending !== 'idle'}
                      type='switch'
                      id='shared-custom-switch-password'
                      onChange={togglePassword}
                      checked={shareLink.password != null || showPasswordForm}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      height={16}
                      width={45}
                      onColor='#5580DC'
                    />
                  </div>
                </Flexbox>
                {(shareLink.password != null || showPasswordForm) && (
                  <form
                    className='share__row share__form'
                    onSubmit={onSubmitPassword}
                  >
                    <input
                      id='share__link__password'
                      value={passwordText}
                      onChange={updatePasswordText}
                      readOnly={sending === 'password'}
                      placeholder='Password...'
                    />
                    <button type='submit'>
                      {sending === 'password' ? (
                        <Spinner className='relative' />
                      ) : (
                        'Save'
                      )}
                    </button>
                  </form>
                )}
                <Flexbox justifyContent='space-between' className='share__row'>
                  <Flexbox
                    flex='1 1 auto'
                    wrap='wrap'
                    className='share__row__label'
                  >
                    <span>Expiration Date</span>
                    {subscription == null && (
                      <button
                        tabIndex={-1}
                        className='upgrade__badge'
                        onClick={() => openSettingsTab('teamUpgrade')}
                      >
                        upgrade
                      </button>
                    )}
                  </Flexbox>
                  <div className='share__row__switch'>
                    <Switch
                      disabled={subscription == null || sending !== 'idle'}
                      type='switch'
                      id='shared-custom-switch'
                      onChange={toggleExpire}
                      checked={shareLink.expireAt != null || showExpireForm}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      height={16}
                      width={45}
                      onColor='#5580DC'
                    />
                  </div>
                </Flexbox>
                {(shareLink.expireAt != null || showExpireForm) && (
                  <form
                    className='share__row share__form'
                    onSubmit={onSubmitExpire}
                  >
                    <DatePicker
                      id='share__link__expire'
                      selected={expireDate}
                      onChange={(date) => {
                        if (!isArray(date)) {
                          setExpireDate(date)
                        }
                      }}
                      disabled={sending === 'expireDate'}
                      minDate={new Date()}
                      autoComplete='off'
                    />
                    <button type='submit'>
                      {sending === 'expireDate' ? (
                        <Spinner className='relative' />
                      ) : (
                        'Save'
                      )}
                    </button>
                  </form>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </>
  )
}

const Container = styled.div`
  .share__form {
    display: flex;
    align-items: center;
    justify-content: space-between;

    input {
      ${inputStyle}
      flex: 1 1 0;
      height: 26px;
      padding: 0 ${({ theme }) => theme.space.xxsmall}px;
      font-size: ${({ theme }) => theme.fontSizes.small}px;
      width: 100%;
    }

    button[type='submit'] {
      ${primaryButtonStyle};
      border-radius: 3px;
      height: 26px;
      line-height: initial;
      margin-left: ${({ theme }) => theme.space.small}px;
      font-size: ${({ theme }) => theme.fontSizes.small}px;
      svg {
        left: 0;
        top: 0;
      }
    }
  }
  .share__row {
    position: relative;
    min-height: 30px;
    line-height: 30px;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    width: 100%;
    text-align: left;
  }

  .share__row + .share__row {
    padding-top: ${({ theme }) => theme.space.xxsmall}px;
    padding-bottom: ${({ theme }) => theme.space.xxsmall}px;
  }

  .share__row__label {
    display: flex;
    align-items: center;
    white-space: none;
    flex: 0 0 auto;
    min-width: 110px;
    margin-right: ${({ theme }) => theme.space.small}px;
    margin-bottom: 0;
  }

  .share__row__switch {
    line-height: initial;
    height: fit-content;
  }

  #settings__share__link {
    ${baseIconStyle};
    align-items: center !important;
    height: 30px !important;
    background: none;
    outline: 0;
    font-size: ${({ theme }) => theme.fontSizes.xsmall}px !important;
    line-height: 30px !important;
  }

  .share__link__input {
    flex: 1 1 0;
    ${borderedInputStyle};
    height: 26px;
    padding: 0 ${({ theme }) => theme.space.xxsmall}px;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    color: ${({ theme }) => theme.subtleTextColor};
  }

  .share__link__copy {
    ${secondaryButtonStyle}
    height: 26px;
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
    align-items:center;
    width: 26px;
    padding: 0;
    text-align: center;
    cursor:pointer;
    &:last-child {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    }
  }
  #share__link__copy {
    ${secondaryButtonStyle}
    height: 26px;
    flex: 0 0 auto;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    line-height: ${({ theme }) => theme.fontSizes.small}px;
  }

  #regenerate__share__link {
    ${inverseSecondaryButtonStyle}
    height: 20px;
    font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
    line-height: ${({ theme }) => theme.fontSizes.xsmall}px;

    svg {
      left: 0;
      top: 0;
    }
  }

  .react-datepicker-wrapper {
    flex: 1 1 auto;
    > div {
      width: 100%;
    }
  }

  .upgrade__badge {
    ${primaryButtonStyle}
    font-size: ${({ theme }) => theme.fontSizes.xxsmall}px;
    border-radius: 3px;
    padding: 0 ${({ theme }) => theme.space.xsmall}px;
    text-transform: uppercase;
    margin-left: ${({ theme }) => theme.space.xsmall}px;
  }

  .share__row__label span {
    min-width: 120px;
  }
`

export default DocShare
