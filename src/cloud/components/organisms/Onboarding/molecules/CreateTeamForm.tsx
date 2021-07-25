import React, { useMemo, FormEvent } from 'react'
import slugify from 'slugify'
import cc from 'classcat'
import IconMdi from '../../../atoms/IconMdi'
import { mdiChevronRight, mdiDomain } from '@mdi/js'
import { boostHubBaseUrl } from '../../../../lib/consts'
import Form from '../../../../../shared/components/molecules/Form'
import FormRow from '../../../../../shared/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../shared/components/molecules/Form/templates/FormRowItem'
import Button, {
  LoadingButton,
} from '../../../../../shared/components/atoms/Button'
import ButtonGroup from '../../../../../shared/components/atoms/ButtonGroup'
import FormImage from '../../../../../shared/components/molecules/Form/atoms/FormImage'
import styled from '../../../../../shared/lib/styled'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import UsageFormRow, { SpaceUsageIntent } from './UsageFormRow'

interface CreateTeamFormProps {
  name: string
  intent?: SpaceUsageIntent
  setIntent: (intent: SpaceUsageIntent) => void
  setName: (val: string) => void
  domain?: string
  setDomain?: (val: string) => void
  onSubmit?: (ev: FormEvent) => void
  showSubmitButton?: boolean
  disabled?: boolean
  sending?: boolean
  fullPage?: boolean
  fileUrl?: string
  onFileChange: (file: File) => void
  goBack?: () => void
}

const CreateTeamForm = ({
  name,
  intent,
  setIntent,
  setName,
  domain = '',
  setDomain,
  onSubmit,
  showSubmitButton = true,
  disabled = false,
  sending = false,
  fullPage = false,
  goBack,
  fileUrl,
  onFileChange,
}: CreateTeamFormProps) => {
  const { translate } = useI18n()
  const slugDomain = useMemo(() => {
    if (domain == null) {
      return boostHubBaseUrl + '/'
    }
    return (
      boostHubBaseUrl +
      '/' +
      slugify(domain.trim().replace(/[^a-zA-Z0-9\-]/g, ''), {
        replacement: '-',
        lower: true,
      })
    )
  }, [domain])

  return (
    <Container>
      <Form
        onSubmit={onSubmit}
        className={cc([fullPage && 'fullPage', 'team__edit__form'])}
      >
        <FormRow fullWidth={true}>
          <FormImage
            onChange={onFileChange}
            defaultUrl={fileUrl}
            defaultIcon={mdiDomain}
            label={
              fileUrl != null
                ? translate(lngKeys.PictureChange)
                : translate(lngKeys.PictureAdd)
            }
            iconSize={100}
            className='profile__image'
          />
        </FormRow>
        <FormRow row={{ title: translate(lngKeys.SpaceName) }} fullWidth={true}>
          <FormRowItem
            item={{
              type: 'input',
              props: {
                value: name,
                onChange: (e) => setName(e.target.value),
                placeholder: translate(lngKeys.GeneralName),
              },
            }}
          />
        </FormRow>
        {setDomain != null && (
          <FormRow
            row={{
              title: translate(lngKeys.SpaceDomain),
              description: (
                <div className='domain__description'>
                  <small>
                    {translate(lngKeys.TeamDomainShow)}{' '}
                    <span className='underlined'>{slugDomain}</span>
                  </small>
                  <br />
                  <small>{translate(lngKeys.TeamDomainWarning)}</small>
                </div>
              ),
            }}
            fullWidth={true}
          >
            <FormRowItem
              item={{
                type: 'input',
                props: {
                  value: domain,
                  onChange: (e) =>
                    setDomain(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-zA-Z0-9\-]/g, '')
                    ),
                  placeholder: 'URL',
                },
              }}
            />
          </FormRow>
        )}
        <UsageFormRow
          intent={intent}
          inSpaceForm={true}
          setIntent={setIntent}
        />
        <FormRow fullWidth={true} className='end__row'>
          <ButtonGroup layout='column' display='flex' flex='1 1 auto'>
            {showSubmitButton && (
              <LoadingButton
                type='submit'
                variant='bordered'
                className='submit-team'
                disabled={disabled}
                spinning={sending}
                size='lg'
              >
                {translate(lngKeys.GeneralContinueVerb)}
              </LoadingButton>
            )}
            {goBack != null && (
              <Button
                variant='transparent'
                className='go-back'
                type='button'
                onClick={goBack}
              >
                <IconMdi path={mdiChevronRight} />{' '}
                {translate(lngKeys.GeneralBack)}
              </Button>
            )}
          </ButtonGroup>
        </FormRow>
      </Form>
    </Container>
  )
}

const Container = styled.div`
  .profile__image {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    .form__image__label {
      margin-left: 0;
      margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
    }
  }
`

export default CreateTeamForm
