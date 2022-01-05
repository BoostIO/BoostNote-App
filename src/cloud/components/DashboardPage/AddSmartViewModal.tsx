import { mdiChevronLeft, mdiClose } from '@mdi/js'
import { capitalize } from 'lodash'
import React from 'react'
import { useCallback } from 'react'
import { useState } from 'react'
import Button from '../../../design/components/atoms/Button'
import Flexbox from '../../../design/components/atoms/Flexbox'
import Icon from '../../../design/components/atoms/Icon'
import { BulkApiActionRes } from '../../../design/lib/hooks/useBulkApi'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { SerializedQuery } from '../../interfaces/db/smartView'
import { SupportedViewTypes } from '../../interfaces/db/view'
import {
  getDescriptionOfViewType,
  getIconPathOfViewType,
} from '../../lib/views'
import SmartViewForm from '../Modal/contents/SmartView/SmartViewForm'

interface AddSmartViewModalProps {
  teamId: string
  addSmartView: (body: {
    name: string
    condition: SerializedQuery
    view: SupportedViewTypes
  }) => Promise<BulkApiActionRes>
}

const AddSmartViewModal = ({
  teamId,
  addSmartView,
}: AddSmartViewModalProps) => {
  const [selectedViewType, setSelectedViewType] = useState<SupportedViewTypes>()
  const { closeLastModal } = useModal()

  if (selectedViewType != null) {
    return (
      <SmartViewCreationModal
        close={closeLastModal}
        back={() => setSelectedViewType(undefined)}
        type={selectedViewType}
        teamId={teamId}
        addSmartView={addSmartView}
      />
    )
  }

  return (
    <ViewTypeSelectorContainer>
      <Flexbox justifyContent='space-between'>
        <h2>New Smart View</h2>
        <Button
          variant='icon'
          iconPath={mdiClose}
          onClick={closeLastModal}
          id='modal-close'
        />
      </Flexbox>
      <div className='smartview__types__wrapper'>
        {(['table', 'kanban', 'calendar', 'list'] as SupportedViewTypes[]).map(
          (viewType) => {
            const icon = getIconPathOfViewType(viewType)
            const desc = getDescriptionOfViewType(viewType)
            return (
              <Button
                variant='transparent'
                className='smartview__type'
                key={viewType}
                id={`smartview__type--${viewType}`}
                onClick={() => setSelectedViewType(viewType)}
              >
                <Flexbox justifyContent='center'>
                  {icon != null && (
                    <Icon path={icon} className='smartview__icon' />
                  )}
                  <strong className='smartview__name'>
                    {capitalize(viewType)}
                  </strong>
                </Flexbox>
                <p className='smartview__description'>{desc}</p>
              </Button>
            )
          }
        )}
      </div>
    </ViewTypeSelectorContainer>
  )
}

const ViewTypeSelectorContainer = styled.div`
  .smartview__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .smartview__type {
    outline: 0;
    background: none;
    margin-left: 0;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
    display: inline-flex;
    width: 49%;
    min-height: 100px;
    border: 1px solid ${({ theme }) => theme.colors.border.second};
    border-radius: ${({ theme }) => theme.borders.radius}px;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px;

    &:hover {
      .smartview__description {
        color: ${({ theme }) => theme.colors.text.primary};
      }
    }
  }

  .smartview__name {
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  .smartview__type .button__label {
    display: block;
  }

  .smartview__type:nth-of-type(2n + 1) {
    margin-right: 2%;
  }

  .smartview__description {
    display: block;
    width: 80%;
    text-align: center;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    color: ${({ theme }) => theme.colors.text.subtle};
    margin-left: auto;
    margin-right: auto;
  }
`

interface SmartViewCreationModalProps {
  back: () => void
  close: () => void
  addSmartView: (body: {
    name: string
    condition: SerializedQuery
    view: SupportedViewTypes
  }) => Promise<BulkApiActionRes>
  type: SupportedViewTypes
  teamId: string
}

const SmartViewCreationModal = ({
  close,
  back,
  type: viewType,
  teamId,
  addSmartView,
}: SmartViewCreationModalProps) => {
  const [sending, setSending] = useState(false)
  const icon = getIconPathOfViewType(viewType)
  const desc = getDescriptionOfViewType(viewType)

  const onSubmit = useCallback(
    async (body: { name: string; condition: SerializedQuery }) => {
      setSending(true)
      const res = await addSmartView({ view: viewType, ...body })
      setSending(false)
      if (!res.err) {
        close()
      }
    },
    [viewType, addSmartView, close]
  )

  return (
    <SmartViewCreationModalContainer>
      <Flexbox justifyContent='space-between'>
        <Button
          variant='transparent'
          iconPath={mdiChevronLeft}
          onClick={back}
          disabled={sending}
        >
          Back
        </Button>
        <Button
          variant='icon'
          iconPath={mdiClose}
          onClick={close}
          id='modal-close'
          disabled={sending}
        />
      </Flexbox>
      <Flexbox className='view__type'>
        <div className='view__type__icon__wrapper'>
          <Icon path={icon} size={26} />
        </div>
        <Flexbox
          direction='column'
          className='view__type__labels'
          alignItems='flex-start'
        >
          <div className='view__type__label'>{capitalize(viewType)}</div>
          <p className='view__type__desc'>{desc}</p>
        </Flexbox>
      </Flexbox>
      <SmartViewForm
        teamId={teamId}
        action='Create'
        onSubmit={onSubmit}
        buttonsAreDisabled={sending}
        defaultConditions={[{ type: 'null', rule: 'and' }]}
      />
    </SmartViewCreationModalContainer>
  )
}

const SmartViewCreationModalContainer = styled.div`
  .modal__heading {
    display: none;
  }

  .view__type {
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .view__type__icon__wrapper {
    width: 50px;
    height: 50px;
    background: ${({ theme }) => theme.colors.background.quaternary};
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .view__type__label {
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .view__type__desc {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    color: ${({ theme }) => theme.colors.text.subtle};
    margin: 0;
  }
`

export default AddSmartViewModal
