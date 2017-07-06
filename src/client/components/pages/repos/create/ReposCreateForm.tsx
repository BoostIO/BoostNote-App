import * as React from 'react'
import {
  State,
  Pages
} from 'client/redux'
import {
  bindActionCreators,
  Dispatch
} from 'redux'
import {
  connect
} from 'react-redux'

interface ReposCreateFormStateProps {
  form: Pages.ReposCreatePage.FormState
}

interface ReposCreateFormDispatchProps {
  updateForm: typeof Pages.ReposCreatePage.ActionCreators.updateForm
  submitForm: typeof Pages.ReposCreatePage.ActionCreators.submitForm
}

type ReposCreateFormProps = ReposCreateFormStateProps & ReposCreateFormDispatchProps

class ReposCreateForm extends React.PureComponent<ReposCreateFormProps, {}> {
  private nameInput: HTMLInputElement

  private updateForm = () => {
    const {
      updateForm
    } = this.props

    updateForm({
      name: this.nameInput.value
    })
  }

  public render() {
    const { form, submitForm } = this.props
    return (
      <div>
        <label>Name</label>
        <input
          ref={e => this.nameInput = e}
          onChange={this.updateForm}
          value={form.name}
        />
        <div>
          <button onClick={submitForm}>Submit</button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: State) => ({
  form: state.pages.repos.create.form
})

const mapDispatchToProps = (dispatch: Dispatch<any>) => (bindActionCreators({
  updateForm: Pages.ReposCreatePage.ActionCreators.updateForm,
  submitForm: Pages.ReposCreatePage.ActionCreators.submitForm
}, dispatch))

export default connect(mapStateToProps, mapDispatchToProps)(ReposCreateForm)
