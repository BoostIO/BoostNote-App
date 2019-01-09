import React from 'react'

type FolderCreateFormProps = {
  createFolder: (folderPath: string) => Promise<void>
}

type FolderCreateFormState = {
  name: string
}

export default class FolderCreateForm extends React.Component<
  FolderCreateFormProps,
  FolderCreateFormState
> {
  state = {
    name: ''
  }
  nameInputRef = React.createRef<HTMLInputElement>()

  updateName = () => {
    this.setState({
      name: this.nameInputRef.current!.value
    })
  }

  createFolder = async () => {
    await this.props.createFolder(this.state.name)
    this.setState({
      name: ''
    })
  }

  render() {
    return (
      <div>
        <label>New folder</label>
        <input
          ref={this.nameInputRef}
          value={this.state.name}
          onChange={this.updateName}
        />
        <button onClick={this.createFolder}>Add</button>
      </div>
    )
  }
}
