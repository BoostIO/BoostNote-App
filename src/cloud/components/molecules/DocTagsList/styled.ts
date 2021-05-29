import styled from '../../../lib/styled'
import { subtleBackgroundColor } from '../../../lib/styled/styleFunctions'

export const StyledDocTagsListWrapper = styled.div`
  display: flex;
  flex: 2 2 auto;
  min-width: 0;
  height: 100%;
  align-items: center;
`

export const StyledDocTagsListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 2 2 auto;
  align-items: center;
  position: relative;
  height: 100%;
  min-width: 0;
`

export const StyledDocTagsList = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  height: 100%;
  box-sizing: content-box;
  padding-bottom: 6px;

  &:not(.list--empty) > div + div,
  &:not(.list--empty) > div:first-child {
    margin-top: 6px !important;
  }

  &.list--empty {
    width: 100%;
  }
`

export const StyledDocTagsListIcon = styled.div`
  color: ${({ theme }) => theme.subtleTextColor};
`

export const StyledTag = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 2px 5px;
  ${subtleBackgroundColor}
  position: relative;
  margin: 0 ${({ theme }) => theme.space.xxsmall}px;
  color: ${({ theme }) => theme.baseTextColor};
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  border-radius: 3px;
  vertical-align: middle;
  height: 25px;
  line-height: 20px;

  &.toolbar-tag {
    align-items: center;
  }

  .removeTag {
    display: inline-block;
    cursor: pointer;
    margin-left: ${({ theme }) => theme.space.xxsmall}px;
    &:hover,
    &:focus {
      color: ${({ theme }) => theme.emphasizedTextColor};
    }

    &disabled {
      pointer-events: none;
    }
  }

  .tag-link {
    display: inline-block;
    max-width: 120px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    color: ${({ theme }) => theme.baseTextColor};
    text-decoration: none;
    &:hover,
    &:focus {
      opacity: 0.8;
    }
  }

  .tag-spinner {
    margin-top: -3px;
    margin-right: ${({ theme }) => theme.space.xxsmall}px;
  }

  &.bg-none {
    background: none;
  }

  &.mb-0 {
    margin-bottom: 0;
  }

  &.size-s {
    height: 100%;
    padding: ${({ theme }) => theme.space.xxsmall}px
      ${({ theme }) => theme.space.xsmall}px;
    font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
    line-height: 1;
  }

  &.ml-xsmall {
    margin-left: ${({ theme }) => theme.space.xsmall}px;
  }
`

export const StyledToolbarExpandTag = styled.button`
  height: 24px;
  color: ${({ theme }) => theme.subtleTextColor};
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  background: none;
  padding: 0;
  display: flex;
  align-items: center;
  margin-top: 6px;
  margin-right: ${({ theme }) => theme.space.xsmall}px;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.emphasizedTextColor};
  }
`
