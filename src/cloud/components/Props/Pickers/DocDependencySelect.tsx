import React, { useCallback, useState, useMemo } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import styled from '../../../../design/lib/styled'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import {
  mdiAccountCircleOutline,
  mdiAlertCircleOutline,
  mdiClose,
  mdiFileDocumentOutline,
  mdiMinusCircleOutline,
} from '@mdi/js'
import { useModal } from '../../../../design/lib/stores/modal'
import PropertyValueButton from './PropertyValueButton'
import {
  SerializedDoc,
  SerializedDocWithSupplemental,
} from '../../../interfaces/db/doc'
import { isObject } from 'lodash'
import { generate } from 'shortid'
import cc from 'classcat'
import Icon from '../../../../design/components/atoms/Icon'
import Button from '../../../../design/components/atoms/Button'
import { useCloudResourceModals } from '../../../lib/hooks/useCloudResourceModals'
import { useNav } from '../../../lib/stores/nav'
import { getDocTitle } from '../../../lib/utils/patterns'
import Form from '../../../../design/components/molecules/Form'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../design/components/molecules/Form/templates/FormRowItem'
import FormSelect, {
  FormSelectOption,
} from '../../../../design/components/molecules/Form/atoms/FormSelect'
import { getMapValues } from '../../../../design/lib/utils/array'
import { overflowEllipsis } from '../../../../design/lib/styled/styleFunctions'

export type DependencyType = 'waiting' | 'blocker' | 'doc'

interface DocDependencySelectProps {
  disabled?: boolean
  defaultValue: { string: string; targetDoc: SerializedDoc }[]
  update: (value: { string: string; targetDoc: string }[]) => void
  isLoading: boolean
  readOnly: boolean
  showIcon?: boolean
  emptyLabel?: string
  popupAlignment?: 'bottom-left' | 'top-left'
}

const DocDependencySelect = ({
  disabled = false,
  defaultValue,
  isLoading,
  showIcon: showIcon,
  emptyLabel,
  readOnly,
  update,
  popupAlignment = 'bottom-left',
}: DocDependencySelectProps) => {
  const { translate } = useI18n()
  const { openContextModal, closeLastModal } = useModal()
  const { openDocPreview } = useCloudResourceModals()
  const { team } = usePage()
  const { docsMap } = useNav()

  const addNewDependency = useCallback(
    (val: {
      string: DependencyType
      targetDoc: SerializedDocWithSupplemental
    }) => {
      return update(
        [...defaultValue, val]
          .filter((prop) => prop.targetDoc != null && prop.string != null)
          .map((prop) => {
            return {
              string: prop.string,
              targetDoc:
                typeof prop.targetDoc === 'string'
                  ? prop.targetDoc
                  : prop.targetDoc.id,
            }
          })
      )
    },
    [update, defaultValue]
  )

  const selectedDocs = useMemo(() => {
    if (defaultValue.length === 0 || team == null) {
      return null
    }

    return (
      <div className='dependencies___wrapper'>
        {defaultValue
          .filter((p) => p.targetDoc != null && isObject(p.targetDoc))
          .sort((a, b) => {
            if (a.targetDoc.id > b.targetDoc.id) {
              return 1
            } else {
              return -1
            }
          })
          .map((p) => {
            const doc = docsMap.get(p.targetDoc.id)
            return (
              <div
                className='dependency__wrapper'
                key={`${generate()}-${p.targetDoc.id}`}
              >
                <Button
                  variant='transparent'
                  className='dependency__label'
                  size='sm'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openDocPreview(docsMap.get(p.targetDoc.id)!, team)
                  }}
                >
                  <DependencyPastille type={p.string as any} />
                  <span className='dependency__label__text'>
                    {getDocTitle(doc || p.targetDoc, 'Untitled')}
                  </span>
                </Button>
                <Button
                  variant='icon'
                  iconPath={mdiClose}
                  size='sm'
                  disabled={disabled}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    update(
                      defaultValue
                        .filter(
                          (val) =>
                            val.targetDoc.id !== p.targetDoc.id &&
                            val.string !== p.targetDoc.id
                        )
                        .map((vals) => {
                          return {
                            string: vals.string,
                            targetDoc: vals.targetDoc.id,
                          }
                        })
                    )
                  }}
                />
              </div>
            )
          })}
      </div>
    )
  }, [defaultValue, team, docsMap, openDocPreview, update, disabled])

  return (
    <Container className='item__dependency___select prop__margin'>
      <PropertyValueButton
        disabled={disabled}
        sending={isLoading}
        empty={defaultValue.length === 0 && emptyLabel == null}
        isReadOnly={readOnly}
        iconPath={
          showIcon || defaultValue.length === 0
            ? mdiAccountCircleOutline
            : undefined
        }
        tag='div'
        onClick={(e) =>
          openContextModal(
            e,
            <NewDependencyModal
              closeModal={closeLastModal}
              create={addNewDependency}
            />,
            {
              alignment: popupAlignment,
              width: 460,
              keepAll: true,
            }
          )
        }
      >
        {defaultValue.length !== 0
          ? selectedDocs
          : emptyLabel != null
          ? emptyLabel
          : translate(lngKeys.Unassigned)}
      </PropertyValueButton>
    </Container>
  )
}

const DependencyPastille = ({ type = 'doc' }: { type: DependencyType }) => {
  return (
    <PastilleContainer
      className={cc(['dependency__pastille', `dependency__pastille--${type}`])}
    >
      <Icon
        size={16}
        path={
          type === 'blocker'
            ? mdiMinusCircleOutline
            : type === 'waiting'
            ? mdiAlertCircleOutline
            : mdiFileDocumentOutline
        }
      />
    </PastilleContainer>
  )
}

const PastilleContainer = styled.div`
  color: ${({ theme }) => theme.colors.text.subtle};
  &.dependency__pastille--blocker {
    color: ${({ theme }) => theme.colors.variants.danger.base};
  }

  &.dependency__pastille--waiting {
    color: ${({ theme }) => theme.colors.variants.warning.base};
  }
`

const Container = styled.div`
  .item__property__button {
    cursor: pointer;
  }

  .dependencies___wrapper {
    display: flex;
    width: auto;
    align-items: center;
    flex-wrap: wrap;
  }

  .dependency__pastille {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .dependency__wrapper {
    display: inline-flex;
    line-height: 23px;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    background: ${({ theme }) => theme.colors.background.quaternary};
    border-radius: ${({ theme }) => theme.borders.radius}px;
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;

    .dependency__label {
      color: ${({ theme }) => theme.colors.text.primary};
      box-shadow: none !important;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`

const NewDependencyModal = ({
  create,
  closeModal,
}: {
  create: (val: { string: DependencyType; targetDoc: any }) => void
  closeModal: () => void
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [dependencyType, setDependencyType] = useState<DependencyType>()
  const [doc, setDoc] = useState<FormSelectOption>()
  const { initialLoadDone, docsMap } = useNav()
  const { translate } = useI18n()

  const dependencyOptions = useMemo(() => {
    const optionsMap = new Map<DependencyType, FormSelectOption>()
    optionsMap.set('blocker', {
      value: 'blocker',
      label: (
        <div className='dependency__option'>
          <DependencyPastille type='blocker' />
          <span>Blocking</span>
        </div>
      ),
    })
    optionsMap.set('waiting', {
      value: 'waiting',
      label: (
        <div className='dependency__option'>
          <DependencyPastille type='waiting' />
          <span>Waiting on</span>
        </div>
      ),
    })
    optionsMap.set('doc', {
      value: 'doc',
      label: (
        <div className='dependency__option'>
          <DependencyPastille type='doc' />
          <span>Documents</span>
        </div>
      ),
    })
    return optionsMap
  }, [])

  const docOptions = useMemo(() => {
    return getMapValues(docsMap).map((doc) => {
      const title = getDocTitle(doc, 'Untitled')
      return {
        value: doc.id,
        fullpath: doc.folderPathname + `/${title}`,
        label: (
          <SearchItem>
            <div className='search__item__label'>
              <span className='search__item__label--main'>{title}</span>
              <span className='search__item__label--path'>
                {doc.folderPathname}
              </span>
            </div>
          </SearchItem>
        ),
      }
    })
  }, [docsMap])

  const onSubmit: React.FormEventHandler = useCallback(
    async (event) => {
      event.preventDefault()
      if (doc == null || dependencyType == null) {
        return
      }

      setSubmitting(true)
      try {
        await create({
          string: dependencyType,
          targetDoc: doc.value as any,
        })
        closeModal()
      } catch (error) {
        setSubmitting(false)
      }
    },
    [doc, dependencyType, create, closeModal]
  )

  const filterOption = (option: FormSelectOption, inputValue: string) => {
    const { fullpath = '' } = (option as any).data as any
    return fullpath.toLocaleLowerCase().includes(inputValue.toLocaleLowerCase())
  }

  return (
    <ModalContainer>
      <Form onSubmit={onSubmit}>
        <FormRow row={{ title: 'Dependency type' }}>
          <FormRowItem>
            <FormSelect
              id='dependency-add-type'
              placeholder='Select'
              isDisabled={submitting}
              value={
                dependencyType != null
                  ? dependencyOptions.get(dependencyType)!
                  : undefined
              }
              onChange={(val) => {
                setDependencyType(val.value)
              }}
              options={[...dependencyOptions.values()]}
            />
          </FormRowItem>
        </FormRow>
        <FormRow row={{ title: 'Doc' }}>
          <FormRowItem>
            <FormSelect
              id='dependency-add-doc'
              isLoading={!initialLoadDone}
              isDisabled={submitting}
              isSearchable={true}
              filterOption={filterOption}
              value={doc}
              placeholder='Search..'
              options={[...docOptions.values()]}
              onChange={(val) => {
                setDoc(val)
              }}
            />
          </FormRowItem>
        </FormRow>
        <FormRow fullWidth={true} className='submit-row'>
          <FormRowItem
            flex='0 0 100px !important'
            item={{
              type: 'button',
              props: {
                type: 'button',
                onClick: closeModal,
                variant: 'secondary',
                label: translate(lngKeys.GeneralCancel),
                disabled: submitting,
              },
            }}
          />
          <FormRowItem
            flex='0 0 100px !important'
            item={{
              type: 'button',
              props: {
                type: 'submit',
                spinning: submitting,
                variant: 'primary',
                label: translate(lngKeys.GeneralSaveVerb),
                disabled: submitting || dependencyType == null || doc == null,
              },
            }}
          />
        </FormRow>
      </Form>
    </ModalContainer>
  )
}

const SearchItem = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 26px;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  margin: 0;
  overflow: hidden;

  .search__item__label {
    ${overflowEllipsis()}
  }

  .search__item__label--path {
    padding-left: ${({ theme }) => theme.sizes.fonts.sm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    color: ${({ theme }) => theme.colors.text.subtle};
    flex: 1 1 auto;
  }
  .search__item__label--main {
    flex: 0 0 auto;
  }
`

const ModalContainer = styled.div`
  .form__select__value-container {
    height: 26px;
  }
  .dependency__option {
    display: inline-flex;
    align-items: center;
    height: 26px;

    .dependency__pastille {
      margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
  }

  .submit-row .form__row__items {
    justify-content: flex-end;
  }
`

export default DocDependencySelect
