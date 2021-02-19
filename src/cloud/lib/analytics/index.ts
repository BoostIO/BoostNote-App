export type AnalyticsEvent =
  | 'create_doc'
  | 'enter_edit_session'
  | 'update_doc'
  | 'update_doc_revision'
  | 'trash_doc'
  | 'delete_doc'
  | 'create_bookmark_doc'
  | 'delete_bookmark_doc'
  | 'create_template_doc'
  | 'delete_template_doc'
  | 'create_folder'
  | 'update_folder'
  | 'delete_folder'
  | 'create_bookmark_folder'
  | 'delete_bookmark_folder'
  | 'delete_user'
  | 'update_user_profile'
  | 'create_team'
  | 'delete_team'
  | 'update_team_profile'
  | 'create_invite'
  | 'delete_invite'
  | 'create_member'
  | 'delete_member'
  | 'create_sub'
  | 'create_free_trial'
  | 'update_sub_card'
  | 'update_sub_email'
  | 'cancel_sub'
  | 'create_block_instance'
  | 'create_block'
  | 'edit_block'
  | 'delete_block'

const report = (event: AnalyticsEvent, _data?: any) => {
  switch (event) {
    case 'create_block_instance':
      break
    case 'create_block':
      break
    case 'edit_block':
      break
    case 'delete_block':
      break
    case 'create_doc':
      break
    case 'enter_edit_session':
      break
    case 'update_doc':
      break
    case 'update_doc_revision':
      break
    case 'delete_doc':
      break
    case 'create_bookmark_doc':
      break
    case 'delete_bookmark_doc':
      break
    case 'create_template_doc':
      break
    case 'delete_template_doc':
      break
    case 'create_folder':
      break
    case 'update_folder':
      break
    case 'delete_folder':
      break
    case 'create_bookmark_folder':
      break
    case 'delete_bookmark_folder':
      break
    case 'delete_user':
      break
    case 'update_user_profile':
      break
    case 'create_team':
      break
    case 'delete_team':
      break
    case 'update_team_profile':
      break
    case 'create_invite':
      break
    case 'delete_invite':
      break
    case 'create_member':
      break
    case 'delete_member':
      break
    case 'create_sub':
      break
    case 'create_free_trial':
      break
    case 'update_sub_card':
      break
    case 'update_sub_email':
      break
    case 'cancel_sub':
      break
  }
}

export default report
