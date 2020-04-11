import React from 'react'
import styled from '../../../lib/styled'
import SortableTree from 'react-sortable-tree'
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer'

const FolderListContainer = styled.div`
  height: 300px;
`

type FolderListProps = {
  folderTreeData: object[]
  handleFolderTreeDataUpdated: (treeData: object[]) => void
}

const FolderList = ({
  folderTreeData,
  handleFolderTreeDataUpdated,
}: FolderListProps) => {
  return (
    <FolderListContainer>
      <SortableTree
        treeData={folderTreeData}
        onChange={handleFolderTreeDataUpdated}
        theme={FileExplorerTheme}
        generateNodeProps={(rowInfo) => ({
          icons: [
              <div
                style={{
                  borderLeft: 'solid 8px gray',
                  borderBottom: 'solid 10px gray',
                  marginRight: 10,
                  boxSizing: 'border-box',
                  width: 16,
                  height: 12,
                  filter: rowInfo.node.expanded
                    ? 'drop-shadow(1px 0 0 gray) drop-shadow(0 1px 0 gray) drop-shadow(0 -1px 0 gray) drop-shadow(-1px 0 0 gray)'
                    : 'none',
                  borderColor: rowInfo.node.expanded ? 'white' : 'gray',
                }}
              />,
            ],
        })}
      />
    </FolderListContainer>
  )
}

export default FolderList
