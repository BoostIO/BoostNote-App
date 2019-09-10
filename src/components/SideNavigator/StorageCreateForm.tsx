import React from 'react'

type SotrageCreateFormProps = {
  createStorage: (storageName: string) => Promise<any>
}

type SotrageCreateFormState = {
  name: string
}

export default class SotrageCreateForm extends React.Component<
  SotrageCreateFormProps,
  SotrageCreateFormState
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

  createStorage = async () => {
    const { createStorage } = this.props
    await createStorage(this.state.name)
    this.setState({
      name: ''
    })
  }

  render() {
    return (
      <div>
        <label>New storage</label>
        <input
          type='text'
          ref={this.nameInputRef}
          value={this.state.name}
          onChange={this.updateName}
        />
        <button type='submit' onClick={this.createStorage}>
          Add
        </button>
      </div>
    )
  }
}
