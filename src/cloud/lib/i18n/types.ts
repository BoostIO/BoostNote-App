export enum lngKeys {
  GeneralError = 'general.error',
  GeneralCancel = 'general.cancel',
  GeneralUpdate = 'general.update',
  GeneralAttachments = 'general.attachments',
  GeneralArchive = 'general.archive',
  GeneralSignin = 'general.signin',
  GeneralSigningIn = 'general.signingin',
  GeneralSignout = 'general.signout',
  GeneralSave = 'general.save',
  GeneralDefault = 'general.default',
  GeneralDelete = 'general.delete',
  GeneralDaily = 'general.daily',
  GeneralWeekly = 'general.weekly',
  GeneralNever = 'general.never',

  //settings
  SettingsInfo = 'settings.info',
  SettingsGeneral = 'settings.general',
  SettingsNotifications = 'settings.notifications',
  SettingsTitle = 'settings.title',
  SettingsPersonalInfo = 'settings.personalInfo',
  SettingsPreferences = 'settings.preferences',
  SettingsTeamInfo = 'settings.teamInfo',
  SettingsTeamMembers = 'settings.teamMembers',
  SettingsTeamUpgrade = 'settings.teamUpgrade',
  SettingsTeamSubscription = 'settings.teamSubscription',
  SettingsIntegrations = 'settings.integrations',
  SettingsAppFeedback = 'settings.appFeedback',

  //UserTab
  SettingsAccount = 'settings.account',
  SettingsAccountDelete = 'settings.account.delete',
  SettingsUILanguage = 'settings.interfaceLanguage',
  SettingsApplicationTheme = 'settings.applicationTheme',
  SettingsEditorTheme = 'settings.editorTheme',
  SettingsCodeBlockTheme = 'settings.codeblockTheme',
  SettingsEditorKeyMap = 'settings.editorKeyMap',
  SettingsLight = 'settings.light',
  SettingsDark = 'settings.dark',
  SettingsNotifFrequencies = 'settings.notificationsFrequency',
  SettingsIndentType = 'settings.indentType',
  SettingsIndentSize = 'settings.indentSize',

  CommunityFeatureRequests = 'community.feature.requests',

  ManagePreferences = 'manage.preferences',
  ManageProfile = 'manage.profile',
  ProfilePicture = 'profile.picture',
  Name = 'name',
  SettingsAccountDeleteWarning = 'settings.account.delete.warning',

  SelectImage = 'select.image',
}

export type TranslationSource = {
  [key in lngKeys]: string
}
