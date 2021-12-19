import React from 'react'
import styled from '../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import cc from 'classcat'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import Button from '../../../design/components/atoms/Button'
import Icon from '../../../design/components/atoms/Icon'
import { usePage } from '../../lib/stores/pageStore'
import { SerializedTeam } from '../../interfaces/db/team'
import { usePreferences } from '../../lib/stores/preferences'
import { overflowEllipsis } from '../../../design/lib/styled/styleFunctions'
import { getDocTitle } from '../../lib/utils/patterns'
import ViewerDisclaimer from '../ViewerDisclaimer'
import DocProperties from '../DocProperties'
import { mdiCommentTextOutline, mdiPencil } from '@mdi/js'

interface DocPageHeaderProps {
  docIsEditable?: boolean
  doc: SerializedDocWithSupplemental
  className?: string
  team: SerializedTeam
}

const DocPageHeader = ({
  doc,
  docIsEditable,
  className,
  team,
}: DocPageHeaderProps) => {
  const { openRenameDocForm } = useCloudResourceModals()
  const { currentUserIsCoreMember } = usePage()
  const { preferences, setPreferences } = usePreferences()

  return (
    <Container className={cc(['doc__page__header', className])}>
      <div className='doc__page__padding'>
        <ViewerDisclaimer />
        {docIsEditable ? (
          <Button
            variant='transparent'
            className={cc([
              'doc__page__header__title',
              !currentUserIsCoreMember && 'doc__page__header__title--disabled',
            ])}
            disabled={!currentUserIsCoreMember}
            onClick={() => openRenameDocForm(doc)}
          >
            <span className='doc__page__header__label'>
              {getDocTitle(doc, 'Untitled')}
            </span>
            <Icon path={mdiPencil} className='doc__page__header__icon' />
          </Button>
        ) : (
          <div className={cc(['doc__page__header__title'])}>
            <span className='doc__page__header__label'>{doc.title}</span>
          </div>
        )}
        <div className='doc__page__header__wrapper'>
          <DocProperties
            doc={doc}
            team={team}
            className='doc__page__header__props'
            currentUserIsCoreMember={currentUserIsCoreMember}
          />
          <Button
            className='doc__page__header__comments'
            variant='icon'
            iconPath={mdiCommentTextOutline}
            active={preferences.docContextMode === 'comment'}
            onClick={() =>
              setPreferences(({ docContextMode }) => ({
                docContextMode:
                  docContextMode === 'comment' ? 'hidden' : 'comment',
              }))
            }
          />
        </div>
      </div>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;

  .doc__page__padding {
    margin: 0 ${({ theme }) => theme.sizes.spaces.md}px;
    width: auto;
    padding-top: ${({ theme }) => theme.sizes.spaces.df}px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  .doc__page__header__comments {
    flex: 0 0 auto;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .doc__page__header__wrapper {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .doc__page__header__title {
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
    color: ${({ theme }) => theme.colors.text.primary};
    width: fit-content;
    width: 100%;
    justify-content: flex-start;

    .doc__page__header__icon {
      display: none;
      margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    .button__label {
      max-width: 100%;
    }

    .doc__page__header__label {
      ${overflowEllipsis}
    }

    &:not(.doc__page__header__title--disabled) {
      .doc__page__header__icon {
        flex: 0 0 auto;
      }
      &:hover {
        .doc__page__header__icon {
          display: block;
        }
        color: ${({ theme }) => theme.colors.text.subtle};
      }
    }
  }

  .doc__page__header__props {
    display: flex;
    flex: 1 1 auto;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export default React.memo(DocPageHeader)
