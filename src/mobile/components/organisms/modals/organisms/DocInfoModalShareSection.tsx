import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { SerializedDocWithSupplemental } from '../../../../../cloud/interfaces/db/doc'
import { useNav } from '../../../../../cloud/lib/stores/nav'
import { usePage } from '../../../../../cloud/lib/stores/pageStore'
import {
  createShareLink,
  deleteShareLink,
  regenerateShareLink,
  updateShareLink,
} from '../../../../../cloud/api/share'
import {
  mdiChevronDown,
  mdiChevronRight,
  mdiOpenInNew,
  mdiClipboardTextOutline,
  mdiLinkVariant,
  mdiClipboardCheckOutline,
  mdiWeb,
} from '@mdi/js'

import copy from 'copy-to-clipboard'
import { inputStyle } from '../../../../../design/lib/styled/styleFunctions'
import DatePicker from 'react-datepicker'
import { isArray } from 'util'
import 'react-datepicker/dist/react-datepicker.css'
import { boostHubBaseUrl } from '../../../../../cloud/lib/consts'
import { SerializedTeam } from '../../../../../cloud/interfaces/db/team'

import { useToast } from '../../../../../design/lib/stores/toast'
import Button from '../../../../../design/components/atoms/Button'
import Switch from '../../../../../design/components/atoms/Switch'
import { useI18n } from '../../../../../cloud/lib/hooks/useI18n'
import { lngKeys } from '../../../../../cloud/lib/i18n/types'
import { capitalize } from '../../../../../cloud/lib/utils/string'
import Spinner from '../../../../../design/components/atoms/Spinner'
import Icon from '../../../../../design/components/atoms/Icon'
import styled from '../../../../../design/lib/styled'
import Flexbox from '../../../../../design/components/atoms/Flexbox'
import UpgradeIntroButton from '../../../atoms/UpgradeIntroModalButton'
import { agentType, sendPostMessage } from '../../../../lib/nativeMobile'
import { getDocLinkHref } from '../../../../lib/href'

interface DocInfoModalShareSectionProps {
  currentDoc: SerializedDocWithSupplemental
  team: SerializedTeam
}

type SendingState =
  | 'idle'
  | 'toggling'
  | 'regenerating'
  | 'password'
  | 'expireDate'

const DocInfoModalShareSection = ({
  currentDoc,
  team,
}: DocInfoModalShareSectionProps) => {
  const { translate } = useI18n()
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
        } catch {
          pushMessage({
            title: 'Error',
            description: 'Could not update the password',
          })
        }
        setSending('idle')
      }
      setShowPasswordForm(false)
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
        } catch {
          pushMessage({
            title: 'Error',
            description: 'Could not update the expiration date',
          })
        }
        setSending('idle')
      }
      setShowExpireForm(false)
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
    sendPostMessage({
      type: 'open-link',
      url: docUrl,
    })
  }, [docUrl])

  const havingPro = subscription != null && subscription.plan === 'pro'

  return (
    <>
      {(agentType === 'ios-native' || agentType === 'android-native') && (
        <>
          <Container className='context__column'>
            <Flexbox className='share__row'>
              <label className='share__row__label'>
                <Icon
                  path={mdiLinkVariant}
                  size={16}
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
              <Button
                variant='secondary'
                onClick={copyDocUrl}
                tabIndex={0}
                className='share__link__copy'
              >
                <Icon
                  path={
                    docUrlCopied
                      ? mdiClipboardCheckOutline
                      : mdiClipboardTextOutline
                  }
                  size={16}
                />
              </Button>
              <Button
                variant='secondary'
                onClick={openNew}
                tabIndex={0}
                className='share__link__copy'
              >
                <Icon path={mdiOpenInNew} size={16} />
              </Button>
            </Flexbox>
          </Container>
          <div className='context__break' />
        </>
      )}
      <Container className='context__column'>
        <Flexbox
          className='share__row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Flexbox
            direction='column'
            flex='0 1 auto'
            justifyContent='flex-start'
            alignItems='flex-start'
            className='content__row__label__column'
          >
            <label className='context__label'>
              <Icon path={mdiWeb} size={16} className='context__icon' />
              {translate(lngKeys.PublicSharing)}
            </label>
            <span className='context__label__description'>
              {translate(lngKeys.PublicSharingDisclaimer)}
            </span>
          </Flexbox>
          <div className='share__row__switch'>
            <Switch
              disabled={sending !== 'idle'}
              id='shared-custom-switch'
              onChange={togglePublicSharing}
              checked={shareLink != null}
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
              <Button
                variant='secondary'
                onClick={copyButtonHandler}
                tabIndex={0}
              >
                <Icon
                  path={
                    copied ? mdiClipboardCheckOutline : mdiClipboardTextOutline
                  }
                  size={16}
                />
              </Button>
            </Flexbox>
            <button
              className='share__row'
              id='settings__share__link'
              onClick={() => setShowSettings((prev) => !prev)}
            >
              <Icon path={showSettings ? mdiChevronDown : mdiChevronRight} />{' '}
              {capitalize(translate(lngKeys.SharingSettings))}
            </button>
            {showSettings && (
              <>
                <Flexbox justifyContent='space-between' className='share__row'>
                  <Flexbox flex='1 1 auto' wrap='wrap'>
                    {capitalize(translate(lngKeys.SharingRegenerateLink))}
                  </Flexbox>
                  <Button
                    variant='secondary'
                    size='sm'
                    disabled={sending != 'idle'}
                    onClick={regenerateCallback}
                  >
                    {sending === 'regenerating' ? (
                      <Spinner className='relative' />
                    ) : (
                      translate(lngKeys.Regenerate)
                    )}
                  </Button>
                </Flexbox>
                <Flexbox justifyContent='space-between' className='share__row'>
                  <Flexbox
                    flex='1 1 auto'
                    wrap='wrap'
                    className='share__row'
                    justifyContent='space-between'
                  >
                    <span>
                      {capitalize(translate(lngKeys.PasswordProtect))}
                    </span>
                    {(subscription == null ||
                      subscription.plan === 'standard') && (
                      <UpgradeIntroButton
                        tabIndex={-1}
                        variant='secondary'
                        popupVariant='sharing-options'
                        origin='share.password'
                        className='upgrade__badge'
                        query={{ teamId: team.id, docId: currentDoc.id }}
                      />
                    )}
                  </Flexbox>
                  {!(
                    subscription == null || subscription.plan === 'standard'
                  ) && (
                    <div className='share__row__switch'>
                      <Switch
                        disabled={subscription == null || sending !== 'idle'}
                        id='shared-custom-switch-password'
                        onChange={togglePassword}
                        checked={shareLink.password != null || showPasswordForm}
                        height={20}
                        width={30}
                        handleSize={14}
                      />
                    </div>
                  )}
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
                      autoComplete={'off'}
                      readOnly={sending === 'password'}
                      placeholder='Password...'
                    />
                    <Button type='submit'>
                      {sending === 'password' ? (
                        <Spinner className='relative' />
                      ) : (
                        capitalize(translate(lngKeys.GeneralSaveVerb))
                      )}
                    </Button>
                  </form>
                )}
                <Flexbox justifyContent='space-between' className='share__row'>
                  <Flexbox
                    flex='1 1 auto'
                    wrap='wrap'
                    className='share__row'
                    justifyContent='space-between'
                  >
                    <span>{capitalize(translate(lngKeys.ExpirationDate))}</span>
                    {!havingPro && (
                      <UpgradeIntroButton
                        tabIndex={-1}
                        variant='secondary'
                        popupVariant='sharing-options'
                        origin='share.expire'
                        className='upgrade__badge'
                        query={{ teamId: team.id, docId: currentDoc.id }}
                      />
                    )}
                  </Flexbox>
                  {havingPro && (
                    <div className='share__row__switch'>
                      <Switch
                        disabled={subscription == null || sending !== 'idle'}
                        id='shared-custom-switch'
                        onChange={toggleExpire}
                        checked={shareLink.expireAt != null || showExpireForm}
                        height={20}
                        width={30}
                        handleSize={14}
                      />
                    </div>
                  )}
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
                        capitalize(translate(lngKeys.GeneralSaveVerb))
                      )}
                    </button>
                  </form>
                )}
              </>
            )}
            <div className='share__break' />
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
      border-radius: 4px;
      flex: 1 1 0;
      height: 26px;
      padding: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
      font-size: ${({ theme }) => theme.sizes.fonts.df}px;
      width: 100%;
    }
  }
  .share__row {
    position: relative;
    min-height: 30px;
    line-height: 30px;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    width: 100%;
    text-align: left;
  }

  .share__row + .share__row {
    padding-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    padding-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .share__row__label {
    display: flex;
    align-items: center;
    white-space: none;
    flex: 0 0 auto;
    min-width: 110px;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin-bottom: 0;
  }

  .share__row__switch {
    line-height: initial;
    height: fit-content;
  }

  #settings__share__link {
    display: flex;
    align-items: center;
    height: 30px !important;
    background: none;
    outline: 0;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    line-height: 30px !important;
    transition: 200ms color;

    &:disabled {
      color: ${({ theme }) => theme.colors.text.subtle};
      &:hover,
      &:focus {
        cursor: not-allowed;
      }
    }
  }

  .share__link__input {
    flex: 1 1 0;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    height: 30px;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    padding: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .react-datepicker-wrapper {
    flex: 1 1 auto;
    > div {
      width: 100%;
    }
  }

  .upgrade__badge {
    margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .share__row__label span {
    min-width: 120px;
  }
  .share__break {
    display: block;
    height: 1px;
    width: 100%;
    margin: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    background-color: ${({ theme }) => theme.colors.border.second};
  }
`

export default DocInfoModalShareSection
