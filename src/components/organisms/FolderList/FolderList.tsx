import React, { useState } from 'react'
import styled from '../../../lib/styled'
import SortableTree from 'react-sortable-tree'
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer'

const FolderListContainer = styled.div``

type FolderListProps = {
  folderTreeData: object[]
  handleFolderTreeDataUpdated: (treeData: object[]) => void
}

const FolderList = ({
  folderTreeData,
  handleFolderTreeDataUpdated,
}: FolderListProps) => {
  return (
    <FolderListContainer style={{ height: 200 }}>
      <SortableTree
        treeData={folderTreeData}
        onChange={handleFolderTreeDataUpdated}
        theme={FileExplorerTheme}
        generateNodeProps={(rowInfo) => ({
          icons: rowInfo.node.isDirectory
            ? [
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
            ]
            : [
              <div
                style={{
                  border: 'solid 1px black',
                  fontSize: 8,
                  textAlign: 'center',
                  marginRight: 10,
                  width: 12,
                  height: 16,
                }}
              >
                F
                </div>,
            ],
          // buttons: [
          //   <button
          //     style={{
          //       padding: 0,
          //       borderRadius: '100%',
          //       backgroundColor: 'gray',
          //       color: 'white',
          //       width: 16,
          //       height: 16,
          //       border: 0,
          //       fontWeight: 100,
          //     }}
          //     onClick={() => console.log('aaa')}
          //   >
          //     i
          //   </button>,
          // ],
        })}
      />
    </FolderListContainer>
  )
}

export default FolderList