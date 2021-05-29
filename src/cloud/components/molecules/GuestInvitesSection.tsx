import React, { useState, useCallback, useMemo } from 'react'
import { SectionList, SectionListItem } from '../organisms/settings/styled'
import { useDialog, DialogIconTypes } from '../../../shared/lib/stores/dialog'
import { useEffectOnce, useSet } from 'react-use'
import { Spinner } from '../atoms/Spinner'
import ErrorBlock from '../atoms/ErrorBlock'
import Flexbox from '../atoms/Flexbox'
import { SerializedGuestInvite } from '../../interfaces/db/guest'
import {
  cancelGuestInvite,
  createGuestInvite,
  getGuestInvites,
} from '../../api/guests/invites'
import Button from '../atoms/Button'
import UserIcon from '../atoms/UserIcon'
import { deleteGuestDoc } from '../../api/guests'
import { usePage } from '../../lib/stores/pageStore'
import Form from '../../../shared/components/molecules/Form'

interface GuestInvitesSectionProps {
  docId: string
  teamId: string
}

const GuestInvitesSection = ({ teamId, docId }: GuestInvitesSectionProps) => {
  const [, { add, has, remove }] = useSet(new Set<string>())
  const [pendingInvites, setPendingInvites] = useState<SerializedGuestInvite[]>(
    []
  )
  const [email, setEmail] = useState<string>('')
  const [error, setError] = useState<unknown>()
  const { messageBox } = useDialog()
  const { guestsMap, updateGuestsMap, setGuestsMap } = usePage()

  useEffectOnce(() => {
    fetchAndSetInvites()
  })

  const guests = useMemo(() => {
    return [...guestsMap.values()].filter((guest) =>
      (guest.docsIds || []).includes(docId)
    )
  }, [docId, guestsMap])

  const fetchAndSetInvites = useCallback(async () => {
    add('fetch')
    try {
      const { invites } = await getGuestInvites({
        teamId,
        docId: docId,
        guest: false,
        pending: true,
      })
      setPendingInvites(invites)
    } catch (error) {
      setError(error)
    }
    remove('fetch')
  }, [teamId, docId, add, remove])

  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(event.target.value)
    },
    [setEmail]
  )

  const submitInvite = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      if (docId == null) {
        return
      }

      setError(undefined)
      add('create')
      try {
        const { invite } = await createGuestInvite({
          teamId,
          email,
          docId,
        })
        setPendingInvites((pendingInvites) => {
          return [...pendingInvites, invite]
        })
        setEmail('')
      } catch (error) {
        setError(error)
      }
      remove('create')
    },
    [teamId, email, docId, add, remove]
  )

  const cancelInvite = useCallback(
    async (invite: SerializedGuestInvite) => {
      messageBox({
        title: `Deactivate?`,
        message: `Are you sure to retract this invite? The invited guest won't be able to access this document anymore.`,
        iconType: DialogIconTypes.Warning,

        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: 'Deactivate',
            onClick: async () => {
              try {
                add(invite.id)
                await cancelGuestInvite(invite.id)
                setPendingInvites((pendingInvites) => {
                  return pendingInvites.filter(
                    (pendingInvite) => pendingInvite.id !== invite.id
                  )
                })
                remove(invite.id)
              } catch (error) {
                setError(error)
              }
              return
            },
          },
        ],
      })
    },
    [messageBox, add, remove]
  )

  const removeGuestAccess = useCallback(
    (guestId: string, docId: string) => {
      messageBox({
        title: `Deactivate?`,
        message: `Are you sure to retract this invite? The invited guest won't be able to access this document anymore.`,
        iconType: DialogIconTypes.Warning,

        buttons: [
          {
            variant: 'secondary',
            label: 'Cancel',
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: 'Deactivate',
            onClick: async () => {
              try {
                add(guestId)
                const { guest: updatedGuest } = await deleteGuestDoc(
                  guestId,
                  docId
                )

                if (updatedGuest == null) {
                  setGuestsMap((prevMap) => {
                    const newMap = new Map(prevMap)
                    newMap.delete(guestId)
                    return newMap
                  })
                } else {
                  updateGuestsMap([updatedGuest.id, updatedGuest])
                }
                remove(guestId)
              } catch (error) {
                setError(error)
              }
              return
            },
          },
        ],
      })
    },
    [messageBox, add, remove, setGuestsMap, updateGuestsMap]
  )

  return (
    <section>
      <Flexbox>
        <h2>Invite with Email</h2>
        {has('fetch') && <Spinner className='relative' style={{ top: 2 }} />}
      </Flexbox>
      <Form
        onSubmit={submitInvite}
        rows={[
          {
            items: [
              {
                type: 'input',
                props: {
                  value: email,
                  placeholder: 'Email...',
                  onChange: onChangeHandler,
                },
              },
              {
                type: 'button',
                props: {
                  variant: 'primary',
                  label: 'Send',
                  spinning: has('create'),
                  disabled: has('create'),
                },
              },
            ],
          },
        ]}
      />
      <SectionList>
        {pendingInvites.map((invite) => (
          <SectionListItem key={invite.id} className='li'>
            <div>{invite.email}</div>
            <div>
              <Button
                variant='outline-secondary'
                onClick={() => cancelInvite(invite)}
                size='sm'
                disabled={has(invite.id)}
              >
                Deactivate
              </Button>
            </div>
          </SectionListItem>
        ))}
      </SectionList>
      <SectionList>
        {guests.map((guest) => (
          <SectionListItem key={guest.id} className='li'>
            <Flexbox>
              <UserIcon user={guest.user} style={{ marginRight: 20 }} />
              {guest.user.displayName}
            </Flexbox>
            <div>
              <Button
                variant='outline-secondary'
                onClick={() => removeGuestAccess(guest.id, docId)}
                size='sm'
                disabled={has(guest.id)}
              >
                Deactivate
              </Button>
            </div>
          </SectionListItem>
        ))}
      </SectionList>
      {error != null && <ErrorBlock error={error} />}
    </section>
  )
}

export default GuestInvitesSection
