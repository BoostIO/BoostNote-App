import React, { useMemo, FormEvent } from 'react'
import slugify from 'slugify'
import CustomButton from '../../atoms/buttons/CustomButton'
import { Spinner } from '../../atoms/Spinner'
import { StyledTeamEditForm } from './styled'
import cc from 'classcat'
import IconMdi from '../../atoms/IconMdi'
import { mdiChevronRight } from '@mdi/js'
import { useRouter } from 'next/router'

interface TeamEditFormProps {
  name: string
  setName: (val: string) => void
  domain?: string
  setDomain?: (val: string) => void
  onSubmit?: (ev: FormEvent) => void
  showSubmitButton?: boolean
  disabled?: boolean
  sending?: boolean
  fullPage?: boolean
  backButton?: boolean
}

const TeamEditForm = ({
  name,
  setName,
  domain = '',
  setDomain,
  onSubmit,
  showSubmitButton = true,
  disabled = false,
  sending = false,
  fullPage = false,
  backButton = false,
}: TeamEditFormProps) => {
  const router = useRouter()

  const slugDomain = useMemo(() => {
    if (domain == null) {
      return process.env.BASE_URL + '/'
    }
    return (
      process.env.BASE_URL +
      '/' +
      slugify(domain.trim().replace(/[^a-zA-Z0-9\-]/g, ''), {
        replacement: '-',
        lower: true,
      })
    )
  }, [domain])
  return (
    <StyledTeamEditForm
      onSubmit={onSubmit}
      className={cc([fullPage && 'fullPage'])}
    >
      <div className='row'>
        <label>Team Name</label>
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Display Name'
        />
      </div>
      {setDomain != null && (
        <div className='row'>
          <label>Choose your team URL</label>
          <div className='flex input-domain'>
            <input
              type='text'
              value={domain}
              onChange={(e) =>
                setDomain(
                  e.target.value.toLowerCase().replace(/[^a-zA-Z0-9\-]/g, '')
                )
              }
              placeholder='URL'
            />
          </div>
          <p className='description'>
            Your url will look like this:
            <span className='underlined'>{slugDomain}</span>
          </p>
          <p className='description'>
            Caution: You can&#39;t change it after creating your team.
          </p>
        </div>
      )}

      <div className='submit-row'>
        {backButton && (
          <CustomButton
            variant='secondary'
            className='go-back'
            onClick={() => router.back()}
          >
            <IconMdi path={mdiChevronRight} /> Go Back
          </CustomButton>
        )}
        {showSubmitButton && (
          <CustomButton
            type='submit'
            variant='primary'
            className='submit-team'
            disabled={disabled}
          >
            {sending ? <Spinner /> : 'Create'}
          </CustomButton>
        )}
      </div>
      <div className='clear' />
    </StyledTeamEditForm>
  )
}

export default TeamEditForm
