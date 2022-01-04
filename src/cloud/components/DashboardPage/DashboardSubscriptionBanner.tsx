import { mdiAlert } from '@mdi/js'
import React from 'react'
import Banner from '../../../design/components/atoms/Banner'
import Icon from '../../../design/components/atoms/Icon'
import styled from '../../../design/lib/styled'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'

interface DashboardSubscriptionBannerProps {
  overLimit?: boolean
}

const DashboardSubscriptionBanner = ({
  overLimit,
}: DashboardSubscriptionBannerProps) => {
  const { translate } = useI18n()
  if (!overLimit) {
    return null
  }

  return (
    <Container variant='warning'>
      <Icon path={mdiAlert} />
      <span>{translate(lngKeys.OverlimitDashboards)}</span>
    </Container>
  )
}

const Container = styled(Banner)`
  position: absolute;
  border-radius: ${({ theme }) => theme.borders.radius}px;
  width: 90%;
  left: 5%;
  top: 10px;
  z-index: 1;

  .banner__content {
    display: flex;
    align-items: center;
  }

  span {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export default DashboardSubscriptionBanner
