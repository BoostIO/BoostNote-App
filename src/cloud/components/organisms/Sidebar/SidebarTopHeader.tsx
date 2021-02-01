import React from 'react'
import styled from '../../../lib/styled'
import Flexbox from '../../atoms/Flexbox'
import IconMdi from '../../atoms/IconMdi'

interface SidebarTopHeaderProps {
  iconPath?: string
  label: React.ReactNode
  controls?: React.ReactNode
}

const SidebarTopHeader = ({
  iconPath,
  label,
  controls,
}: SidebarTopHeaderProps) => {
  return (
    <>
      <StyledSidebarTopHeader>
        {iconPath != null && (
          <div className='icon'>
            <IconMdi path={iconPath} size={20} />
          </div>
        )}
        <Flexbox className='wrapper' flex='1 1 auto'>
          <Flexbox flex='1 1 auto'>
            <span className='label'>{label}</span>
          </Flexbox>
          {controls != null && <Flexbox flex='0 0 auto'>{controls}</Flexbox>}
        </Flexbox>
      </StyledSidebarTopHeader>
    </>
  )
}

export default SidebarTopHeader

const StyledSidebarTopHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-width: 0;
  height: 34px;
  line-height: 34px;
  color: ${({ theme }) => theme.subtleTextColor};
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  text-align: left;
  text-transform: uppercase;

  .icon {
    width: 28px;
    text-align: center;
    flex: 0 0 auto;
    padding: 0px;
  }

  .label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
