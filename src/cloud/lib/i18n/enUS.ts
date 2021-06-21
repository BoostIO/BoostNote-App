import { lngKeys, TranslationSource } from './types'

const enTranslation: TranslationSource = {
  //General
  [lngKeys.GeneralError]: 'Error',
  [lngKeys.GeneralCreate]: 'Create',
  [lngKeys.GeneralCancel]: 'Cancel',
  [lngKeys.GeneralUpdate]: 'Update',
  [lngKeys.GeneralAttachments]: 'Attachments',
  [lngKeys.GeneralArchive]: 'Archive',
  [lngKeys.GeneralSignin]: 'Sign In',
  [lngKeys.GeneralSigningIn]: 'Signing in...',
  [lngKeys.GeneralSignout]: 'Sign Out',
  [lngKeys.GeneralSave]: 'Save',
  [lngKeys.GeneralDefault]: 'Default',
  [lngKeys.GeneralDelete]: 'Delete',
  [lngKeys.GeneralDaily]: 'daily',
  [lngKeys.GeneralWeekly]: 'weekly',
  [lngKeys.GeneralNever]: 'never',

  // settings
  [lngKeys.SettingsInfo]: 'My Info',
  [lngKeys.SettingsGeneral]: 'My Preferences',
  [lngKeys.SettingsNotifications]: 'Email notifications',
  [lngKeys.SettingsTeamInfo]: 'Settings',
  [lngKeys.SettingsTitle]: 'Settings',
  [lngKeys.SettingsPersonalInfo]: 'Settings',
  [lngKeys.SettingsPreferences]: 'Preferences',
  [lngKeys.SettingsTeamMembers]: 'Members',
  [lngKeys.SettingsTeamUpgrade]: 'Upgrade',
  [lngKeys.SettingsTeamSubscription]: 'Billing',
  [lngKeys.SettingsIntegrations]: 'Integrations',
  [lngKeys.SettingsAppFeedback]: 'Feedback',
  [lngKeys.SettingsSpace]: 'Space',
  [lngKeys.SettingsSpaceDelete]: 'Delete this Space',
  [lngKeys.SettingsSpaceDeleteWarning]:
    'Once you delete this space, we will remove all associated data. There is no turning back.',

  // settings UserTab
  [lngKeys.SettingsAccount]: 'Account',
  [lngKeys.SettingsAccountDelete]: 'Delete Your Account',
  [lngKeys.SettingsUILanguage]: 'Interface Language',
  [lngKeys.SettingsApplicationTheme]: 'Application Theme',
  [lngKeys.SettingsEditorTheme]: 'Editor Theme',
  [lngKeys.SettingsCodeBlockTheme]: 'Code Block Theme',
  [lngKeys.SettingsEditorKeyMap]: 'Editor Keymap',
  [lngKeys.SettingsLight]: 'Light',
  [lngKeys.SettingsDark]: 'Dark',
  [lngKeys.SettingsNotifFrequencies]: 'Email updates',
  [lngKeys.SettingsIndentType]: 'Editor Indent Type',
  [lngKeys.SettingsIndentSize]: 'Editor Indent Size',
  [lngKeys.SettingsUserForum]: 'User Forum (New!)',

  // Settings Community
  [lngKeys.CommunityFeatureRequests]: 'Feature Requests',

  [lngKeys.ManagePreferences]: 'Manage your preferences.',
  [lngKeys.ManageProfile]: 'Manage your Boost Note profile.',
  [lngKeys.ManageSpaceSettings]: "Manage your space's settings.",
  [lngKeys.SettingsAccountDeleteWarning]:
    'You may delete your account at any time, note that this is unrecoverable.',

  [lngKeys.FormSelectImage]: 'Select Image',
  [lngKeys.FormChangeImage]: 'Change Image',

  //Language
  [lngKeys.ProfilePicture]: 'Profile Picture',
  [lngKeys.Name]: 'Name',
  [lngKeys.Spaces]: 'spaces',
  [lngKeys.Tabs]: 'tab',
}

export default {
  translation: enTranslation,
}
