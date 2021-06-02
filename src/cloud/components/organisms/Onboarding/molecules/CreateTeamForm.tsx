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

interface CreateTeamFormProps {
  name: string
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
            label='Add a photo'
            iconSize={100}
            className='profile__image'
          />
        </FormRow>
        <FormRow row={{ title: 'Team Name' }} fullWidth={true}>
          <FormRowItem
            item={{
              type: 'input',
              props: {
                value: name,
                onChange: (e) => setName(e.target.value),
                placeholder: 'Display Name',
              },
            }}
          />
        </FormRow>
        {setDomain != null && (
          <FormRow
            row={{
              title: 'Choose your team URL',
              description: (
                <div className='domain__description'>
                  <small>
                    Your url will look like this:
                    <span className='underlined'>{slugDomain}</span>
                  </small>
                  <br />
                  <small>
                    Caution: You can&#39;t change it after creating your team.
                  </small>
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
                Continue
              </LoadingButton>
            )}
            {goBack != null && (
              <Button
                variant='transparent'
                className='go-back'
                type='button'
                onClick={goBack}
              >
                <IconMdi path={mdiChevronRight} /> Go Back
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
