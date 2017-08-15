import * as React from 'react'
import { connect } from 'react-redux'
import { State } from 'client/redux'

interface Form {
  name: string
}

interface CreateFormProps {
  form: {
    name: string
  }
  updateForm: (form: Form) => void
  submitForm: () => void
}

class CreateForm extends React.PureComponent<CreateFormProps, {}> {
  private nameInput: HTMLInputElement

  private updateForm = () => {
    const {
      updateForm
    } = this.props

    updateForm({
      name: this.nameInput.value
    })
  }

  public render () {
    const { form, submitForm } = this.props
    return (
      <div>
        <div>
          <label>Name</label>
          <input
            ref={e => this.nameInput = e}
            onChange={this.updateForm}
            value={form.name}
          />
        </div>
        <div>
          <button onClick={submitForm}>Submit</button>
        </div>
      </div>
    )
  }
}

export default CreateForm
