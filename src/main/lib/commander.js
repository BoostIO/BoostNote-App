import store from 'main/lib/redux/store'
import Dialog from 'main/lib/Dialog'
import dataAPI from 'main/lib/dataAPI'
import history from 'main/history'

const DEFAULT_FOLDER_NAME = 'Notes'
// TODO: this should be bound to Main or Nav directly to access state of Nav
export function deleteFolder (storageName, folderName) {
  if (folderName === DEFAULT_FOLDER_NAME) return null

  Dialog.showMessageBox({
    message: `Are you sure you want to delete "${folderName}"?`,
    detail: 'All notes and any subfolders will be deleted.',
    buttons: ['Confirm', 'Cancel']
  }, (index) => {
    if (index === 0) {
      dataAPI.deleteFolder(storageName, folderName)
        .then(() => {
          history.push({
            pathname: '/storages/' + storageName + '/folders/Notes'
          })
        })
        .then(() => {
          store.dispatch({
            type: 'DELETE_FOLDER',
            payload: {
              storageName,
              folderName
            }
          })
        })
    }
  })
}

const commander = {
  deleteFolder
}

export default commander
