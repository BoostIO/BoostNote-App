import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { SerializedDocWithBookmark } from '../../interfaces/db/doc'
import { useNav } from '../../lib/stores/nav'
import { usePage } from '../../lib/stores/pageStore'
import {
  createShareLink,
  deleteShareLink,
  updateShareLink,
} from '../../api/share'
import {
  mdiClipboardTextOutline,
  mdiClipboardCheckOutline,
  mdiEarth,
} from '@mdi/js'
import copy from 'copy-to-clipboard'
import { isArray } from 'util'
import 'react-datepicker/dist/react-datepicker.css'
import { boostHubBaseUrl } from '../../lib/consts'
import { SerializedTeam } from '../../interfaces/db/team'
import { useToast } from '../../../design/lib/stores/toast'
import Button, { LoadingButton } from '../../../design/components/atoms/Button'
import Switch from '../../../design/components/atoms/Switch'
import UpgradeIntroButton from '../UpgradeIntroButton'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { capitalize } from '../../lib/utils/string'
import Banner from '../../../design/components/atoms/Banner'
import styled from '../../../design/lib/styled'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import cc from 'classcat'
import Form from '../../../design/components/molecules/Form'
import FormDatePicker from '../../../design/components/molecules/Form/atoms/FormDatePicker'
import Portal from '../../../design/components/atoms/Portal'
import Flexbox from '../../../design/components/atoms/Flexbox'
import Icon from '../../../design/components/atoms/Icon'

type SendingState =
  | 'idle'
  | 'toggling'
  | 'regenerating'
  | 'password'
  | 'expireDate'

interface DocShareProps {
  currentDoc: SerializedDocWithBookmark
  team: SerializedTeam
}

const WrappedDocShare = ({ currentDoc, team }: DocShareProps) => {
  const { docsMap } = useNav()

  const doc = useMemo(() => {
    return docsMap.get(currentDoc.id)
  }, [docsMap, currentDoc.id])

  if (doc == null) {
    return <Banner variant='danger'>This document does not exist</Banner>
  }

  return <DocShare currentDoc={doc} team={team} />
}

const DocShare = ({ currentDoc, team }: DocShareProps) => {
  const { translate } = useI18n()
  const [sending, setSending] = useState<SendingState>('idle')
  const { updateDocsMap } = useNav()
  const { setPartialPageData, subscription } = usePage()
  const { pushMessage } = useToast()
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

  const havingPro = subscription != null && subscription.plan === 'pro'

  return (
    <>
      <Container className='doc__share'>
        <div className='doc__share__row'>
          <Icon path={mdiEarth} className='doc__share__icon' size={34} />
          <Flexbox
            flex='1 1 auto'
            direction='column'
            justifyContent='flex-start'
            alignItems='flex-start'
            className='doc__share__title'
          >
            <label className='doc__share__label'>
              {translate(lngKeys.PublicSharing)}
            </label>
            <span className='doc__share__description'>
              {translate(lngKeys.PublicSharingDisclaimer)}
            </span>
          </Flexbox>
          <div className='doc__share__toggle'>
            <Switch
              disabled={sending !== 'idle'}
              id='shared-custom-switch'
              onChange={togglePublicSharing}
              checked={shareLink != null}
            />
          </div>
        </div>
        {shareLink != null && (
          <>
            <div className='doc__share__row'>
              <FormInput
                readOnly={true}
                className='doc__share__link'
                value={sharedLinkHref}
              />
              <Button
                variant='transparent'
                onClick={copyButtonHandler}
                tabIndex={0}
                id='share__link__copy'
                iconPath={
                  copied ? mdiClipboardCheckOutline : mdiClipboardTextOutline
                }
              />
            </div>

            <div
              className={cc([
                'doc__share__row doc__share__row--secondary',
                (shareLink.password != null || showPasswordForm) &&
                  'doc__share__row--opened',
              ])}
            >
              <Flexbox justifyContent='space-between'>
                <label className='doc__share__row__label'>
                  {capitalize(translate(lngKeys.PasswordProtect))}
                </label>
                {!havingPro ? (
                  <UpgradeIntroButton
                    variant='secondary'
                    popupVariant='sharing-options'
                    origin='share.password'
                    className='upgrade__badge'
                    query={{ teamId: team.id, docId: currentDoc.id }}
                  />
                ) : (
                  <div className='doc__share__toggle'>
                    <Switch
                      disabled={subscription == null || sending !== 'idle'}
                      id='shared-custom-switch-password'
                      onChange={togglePassword}
                      checked={shareLink.password != null || showPasswordForm}
                    />
                  </div>
                )}
              </Flexbox>
              {(shareLink.password != null || showPasswordForm) && (
                <Form className='doc__share__form' onSubmit={onSubmitPassword}>
                  <FormInput
                    id='share__link__password'
                    value={passwordText}
                    onChange={updatePasswordText}
                    autoComplete={'off'}
                    readOnly={sending === 'password'}
                    placeholder={translate(lngKeys.GeneralPassword)}
                  />
                  <LoadingButton
                    variant='primary'
                    spinning={sending === 'password'}
                    disabled={sending !== 'idle'}
                    type='submit'
                  >
                    {capitalize(translate(lngKeys.GeneralSaveVerb))}
                  </LoadingButton>
                </Form>
              )}
            </div>

            <div
              className={cc([
                'doc__share__row doc__share__row--secondary',
                (shareLink.expireAt != null || showExpireForm) &&
                  'doc__share__row--opened',
              ])}
            >
              <Flexbox justifyContent='space-between'>
                <label className='doc__share__row__label'>
                  {capitalize(translate(lngKeys.ExpirationDate))}
                </label>
                {!havingPro ? (
                  <UpgradeIntroButton
                    variant='secondary'
                    popupVariant='sharing-options'
                    origin='share.expire'
                    className='upgrade__badge'
                    query={{ teamId: team.id, docId: currentDoc.id }}
                  />
                ) : (
                  <div className='doc__share__toggle'>
                    <Switch
                      disabled={subscription == null || sending !== 'idle'}
                      id='shared-custom-switch'
                      onChange={toggleExpire}
                      checked={shareLink.expireAt != null || showExpireForm}
                    />
                  </div>
                )}
              </Flexbox>
              {(shareLink.expireAt != null || showExpireForm) && (
                <Form className='doc__share__form' onSubmit={onSubmitExpire}>
                  <FormDatePicker
                    id='share__link__expire'
                    selected={expireDate}
                    onChange={(date) => {
                      if (!isArray(date)) {
                        setExpireDate(date)
                      }
                    }}
                    disabled={sending === 'expireDate'}
                    placeholderText={capitalize(
                      translate(lngKeys.ExpirationDate)
                    )}
                    minDate={new Date()}
                    autoComplete='off'
                    popperContainer={CalendarContainer}
                  />
                  <LoadingButton
                    variant='primary'
                    spinning={sending === 'expireDate'}
                    disabled={sending !== 'idle'}
                    type='submit'
                  >
                    {capitalize(translate(lngKeys.GeneralSaveVerb))}
                  </LoadingButton>
                </Form>
              )}
            </div>
          </>
        )}
      </Container>
    </>
  )
}

const CalendarContainer = ({ children }: { children: any }) => {
  return (
    <Portal
      domTarget={document.getElementsByClassName('modal__window__anchor')[0]!}
    >
      {children}
    </Portal>
  )
}

const Container = styled.div`
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  .doc__share__form {
    display: flex;
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;

    input {
      flex: 1 1 auto;
    }

    button {
      flex: 0 0 auto;
      margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
    }
  }

  .react-datepicker-wrapper,
  .react-datepicker__input-container {
    flex: 1 1 auto;
  }

  .react-datepicker__input-container {
    display: flex;
  }

  .doc__share__row--secondary {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    > * {
      width: 100%;
    }
  }

  .doc__share__row {
    display: flex;
    width: 100%;
    align-items: center;
  }

  .doc__share__row--secondary:not(.doc__share__row--opened)
    + .doc__share__row--secondary {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .doc__share__link,
  .doc__share__row__label {
    flex: 1 1 auto;
  }

  .doc__share__row__label {
  }

  .doc__share__row + .doc__share__row {
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;
  }

  .doc__share__icon {
    color: ${({ theme }) => theme.colors.text.subtle};
    flex: 0 0 auto;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .doc__share__toggle {
    flex: 0 0 auto;
  }

  .doc__share__label {
    display: block;
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .doc__share__description {
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    color: ${({ theme }) => theme.colors.text.subtle};
  }
`

export default React.memo(WrappedDocShare)
