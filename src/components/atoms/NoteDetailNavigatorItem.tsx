import styled from '../../lib/styled'

const NoteDetailNavigatorItem = styled.button`
  background-color: transparent;
  border: none;
  display: flex;
  white-space: nowrap;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.navItemColor};
  user-select: none;
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  &.active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }
`

export default NoteDetailNavigatorItem
