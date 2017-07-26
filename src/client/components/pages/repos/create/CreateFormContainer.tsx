import * as React from 'react'
import {
  State,
  Pages
} from 'client/redux'
import {
  bindActionCreators,
  Dispatch
} from 'redux'
import { connect } from 'react-redux'
import CreateForm from './CreateForm'

interface CreateFormContainerStateProps {
  form: Pages.ReposCreatePage.FormState
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
  form: state.pages.ReposCreate.form
})

const mapDispatchToProps = {
  updateForm: Pages.ReposCreatePage.ActionCreators.updateForm,
  submitForm: Pages.ReposCreatePage.ActionCreators.submitForm
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateFormContainer)
