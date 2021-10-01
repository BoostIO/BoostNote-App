import React, { forwardRef } from 'react'
import { LoadingButton } from '../../../../../design/components/atoms/Button'
import styled from '../../../../../design/lib/styled'
import Flexbox from '../../../../../design/components/atoms/Flexbox'
import Scroller from '../../../../../design/components/atoms/Scroller'
import cc from 'classcat'
import { SerializedTag } from '../../../../interfaces/db/tag'
import { SerializedDoc } from '../../../../interfaces/db/doc'
import { mdiFileDocumentOutline, mdiTag, mdiTrashCanOutline } from '@mdi/js'
import Icon from '../../../../../design/components/atoms/Icon'
import plur from 'plur'
import NavigationItem from '../../../../../design/components/molecules/Navigation/NavigationItem'
import { getDocTitle } from '../../../../lib/utils/patterns'
import { useRouter } from '../../../../lib/router'
import { useModal } from '../../../../../design/lib/stores/modal'
import { getDocLinkHref } from '../../../Link/DocLink'
import { SerializedTeam } from '../../../../interfaces/db/team'
import UpDownList from '../../../../../design/components/atoms/UpDownList'
import EditableInput from '../../../../../design/components/atoms/EditableInput'
import { UpdateTagRequestBody } from '../../../../api/teams/tags'
import Spinner from '../../../../../design/components/atoms/Spinner'

interface LabelsManagementModalDetailProps {
  tag?: SerializedTag
  sending?: string
  deleteTag: (tag: SerializedTag) => void
  updateTag: (tag: SerializedTag, body: UpdateTagRequestBody) => void
  team: SerializedTeam
  docs: SerializedDoc[]
}

const LabelsManagementModalDetail = forwardRef<
  HTMLDivElement,
  LabelsManagementModalDetailProps
>(({ tag, deleteTag, updateTag, docs, team, sending }, ref) => {
  const { push } = useRouter()
  const { closeAllModals } = useModal()
  return (
    <UpDownList ignoreFocus={true}>
      <Container className={cc(['label__modal__detail'])} ref={ref}>
        <Flexbox
          alignItems='center'
          justifyContent='space-between'
          className={cc([
            'label__detail__header',
            tag == null && 'label__detail__header--empty',
          ])}
        >
          {tag != null && (
            <>
              <Flexbox
                flex='1 1 auto'
                className={'label__detail__title'}
                justifyContent='flex-start'
                alignItems='center'
              >
                <Icon path={mdiTag} />
                <EditableInput
                  disabled={sending != null}
                  placeholder={'Label...'}
                  text={tag.text}
                  onTextChange={(newText) => updateTag(tag, { text: newText })}
                />
              </Flexbox>
              <Flexbox flex='0 0 auto'>
                {sending === 'update' && <Spinner />}
                <LoadingButton
                  size='sm'
                  variant='icon'
                  iconPath={mdiTrashCanOutline}
                  disabled={sending != null}
                  spinning={sending === 'delete'}
                  onClick={() => deleteTag(tag)}
                  id='delete__tag__btn'
                />
              </Flexbox>
            </>
          )}
        </Flexbox>
        <Scroller className='label__detail__scroller'>
          {tag == null ? (
            <div className='label__detail__description'>Select a label...</div>
          ) : docs.length === 0 ? (
            <div className='label__detail__description'>
              This label does not have any doc linked to it
            </div>
          ) : (
            <>
              <div className='label__detail__description'>
                {docs.length} {plur('document', docs.length)}
              </div>
              {docs.map((doc) => {
                const href = `${process.env.BOOST_HUB_BASE_URL}${getDocLinkHref(
                  doc,
                  team,
                  'index'
                )}`

                return (
                  <NavigationItem
                    key={doc.id}
                    id={`doc-${doc.id}`}
                    labelHref={href}
                    labelClick={() => {
                      push(href)
                      return closeAllModals()
                    }}
                    label={getDocTitle(doc, 'Untitled')}
                    borderRadius={true}
                    icon={
                      doc.emoji != null
                        ? { type: 'emoji', path: doc.emoji }
                        : {
                            type: 'icon',
                            path: mdiFileDocumentOutline,
                          }
                    }
                  />
                )
              })}
            </>
          )}
        </Scroller>
      </Container>
    </UpDownList>
  )
})

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  .label__detail__header {
    flex: 0 0 auto;
    padding-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
    border-bottom: 1px solid transparent;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
    height: 40px;
    padding-left: ${({ theme }) => theme.sizes.spaces.df}px;
    padding-right: ${({ theme }) => theme.sizes.spaces.df}px;

    &:not(.label__detail__header--empty) {
      border-color: ${({ theme }) => theme.colors.border.second};
    }
  }

  .label__detail__title {
    span {
      padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
  }

  .label__detail__scroller {
    flex: 1 1 auto;
    padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .label__detail__description {
    color: ${({ theme }) => theme.colors.text.subtle};
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

export default LabelsManagementModalDetail
