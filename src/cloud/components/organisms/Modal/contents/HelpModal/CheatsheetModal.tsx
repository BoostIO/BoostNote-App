import React from 'react'
import { ModalTable, ModalContainer, SectionHeader2 } from '../styled'
import { MetaKeyText } from '../../../../../lib/keyboard'

const CheatSheetModal = () => {
  return (
    <ModalContainer>
      <SectionHeader2>
        Keyboard shortcuts in Boost Note for Teams
      </SectionHeader2>
      <p>
        <sup>*</sup>Single Key Shortcuts are only applicable outside of
        inputtable elements ( input, textarea, select )
      </p>
      <h4>All Pages</h4>
      <ModalTable>
        <tbody>
          <tr>
            <td>Help</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>{`${MetaKeyText()}`}</span>
              <span className='shortcut-key'>H</span>
            </td>
          </tr>
          <tr>
            <td>Search</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>{`${MetaKeyText()}`}</span>

              <span className='shortcut-key'>P</span>
            </td>
          </tr>
          <tr>
            <td>User settings</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>,</span>
            </td>
          </tr>
          <tr>
            <td>Invite members</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>I</span>
            </td>
          </tr>
          <tr>
            <td>Create a document</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>N</span>
            </td>
          </tr>
          <tr>
            <td>Create a Folder</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>F</span>
            </td>
          </tr>
          <tr>
            <td>Switch Team</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>S</span>
            </td>
          </tr>
        </tbody>
      </ModalTable>
      <h4>Navigation</h4>
      <ModalTable>
        <tbody>
          <tr>
            <td>When a sidebar is present: focus the first element of it</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>{`${MetaKeyText()}`}</span>
              <span className='shortcut-key'>Shift</span>
              <span className='shortcut-key'>&larr;</span>
            </td>
          </tr>
          <tr>
            <td>
              When a sidebar is present: focus the first element of the side
              content
            </td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>{`${MetaKeyText()}`}</span>
              <span className='shortcut-key'>Shift</span>
              <span className='shortcut-key'>&rarr;</span>
            </td>
          </tr>
          <tr>
            <td>In the sidebar: previous element</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>&uarr;</span>
            </td>
          </tr>
          <tr>
            <td>In the sidebar: next element</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>&darr;</span>
            </td>
          </tr>
          <tr>
            <td>In the sidebar: unfold a folder</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>&rarr;</span>
            </td>
          </tr>
          <tr>
            <td>In the sidebar: fold a folder</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>&larr;</span>
            </td>
          </tr>
        </tbody>
      </ModalTable>
      <h4>Folder Page</h4>
      <ModalTable>
        <tbody>
          <tr>
            <td>Bookmark</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>B</span>
            </td>
          </tr>
          <tr>
            <td>Edit the Folder</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>E</span>
            </td>
          </tr>
          <tr>
            <td>Delete</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>{`${MetaKeyText()}`}</span>
              <span className='shortcut-key'>Shift</span>
              <span className='shortcut-key'>Delete</span>
            </td>
          </tr>
        </tbody>
      </ModalTable>
      <h4>Doc Page</h4>
      <ModalTable>
        <tbody>
          <tr>
            <td>Toggle View Mode</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>{`${MetaKeyText()}`}</span>
              <span className='shortcut-key'>M</span>
            </td>
          </tr>
          <tr>
            <td>Change to edit Mode</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>{`${MetaKeyText()}`}</span>
              <span className='shortcut-key'>Shift</span>
              <span className='shortcut-key'>E</span>
            </td>
          </tr>
          <tr>
            <td>Change to split Mode</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>{`${MetaKeyText()}`}</span>
              <span className='shortcut-key'>Shift</span>
              <span className='shortcut-key'>S</span>
            </td>
          </tr>
          <tr>
            <td>Change to preview Mode</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>{`${MetaKeyText()}`}</span>
              <span className='shortcut-key'>Shift</span>
              <span className='shortcut-key'>P</span>
            </td>
          </tr>
          <tr>
            <td>Bookmark</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>B</span>
            </td>
          </tr>
          <tr>
            <td>Delete</td>
            <td className='shortcut-key-table'>
              <span className='shortcut-key'>{`${MetaKeyText()}`}</span>
              <span className='shortcut-key'>Shift</span>
              <span className='shortcut-key'>Delete</span>
            </td>
          </tr>
        </tbody>
      </ModalTable>
    </ModalContainer>
  )
}

export default CheatSheetModal
