import { mdiChevronRight } from '@mdi/js'
import { Emoji } from 'emoji-mart'
import React from 'react'
import styled from '../../lib/styled'
import Icon from '../atoms/Icon'
import { TopbarBreadcrumbProps } from '../../../components/v2/organisms/Topbar'

interface FlattenedBreadcrumbsProps {
  breadcrumbs: TopbarBreadcrumbProps[]
}

const FlattenedBreadcrumbs = ({ breadcrumbs }: FlattenedBreadcrumbsProps) => {
  return (
    <Container className='flattened__breadcrumb'>
      {breadcrumbs.map((breadCrumb, j) => {
        return (
          <React.Fragment key={`breadcrumb-${j}`}>
            <div className='flattened__breadcrumb'>
              {(breadCrumb.emoji != null || breadCrumb.icon != null) && (
                <div className='flattened__breadcrumb__icon'>
                  {breadCrumb.emoji != null ? (
                    <Emoji emoji={breadCrumb.emoji} set='apple' size={16} />
                  ) : (
                    <Icon path={breadCrumb.icon!} size={16} />
                  )}
                </div>
              )}
              <span className='flattened__breadcrumb__label'>
                {breadCrumb.label}
              </span>
            </div>
            {j < breadcrumbs.length - 1 && (
              <Icon
                path={mdiChevronRight}
                size={16}
                className='flattened__breadcrumb__separator'
              />
            )}
          </React.Fragment>
        )
      })}
    </Container>
  )
}

export default FlattenedBreadcrumbs

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .flattened__breadcrumb {
    display: flex;
    flex-align: center;
    align-items: center;
  }

  .flattened__breadcrumb__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .flattened__breadcrumb__separator {
  }
`
