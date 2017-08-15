import * as React from 'react'
import { State, Actions } from 'client/redux'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import CreateForm from './CreateForm'

interface CreateFormContainerStateProps {
  form: {
    name: string
  }
}

type CreateFormContainerProps = CreateFormContainerStateProps & typeof mapDispatchToProps
const CreateFormContainer = ({
  form,
  updateForm,
  submitForm
}: CreateFormContainerProps) => (
  <CreateForm
    form={form}
    updateForm={updateForm}
    submitForm={submitForm}
  />
)

const mapStateToProps = (state: State) => ({
  form: {
    name: state.Pages.ReposCreate.name
  }
})

const mapDispatchToProps = {
  updateForm: Actions.Pages.ReposCreate.ActionCreators.updateForm,
  submitForm: Actions.Pages.ReposCreate.ActionCreators.submitForm
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateFormContainer)
