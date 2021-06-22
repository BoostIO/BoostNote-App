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
  [lngKeys.SettingsAccount]: 'Account',
  [lngKeys.SettingsAccountDelete]: 'Delete Your Account',
  [lngKeys.SettingsAccountDeleteWarning]:
    'You may delete your account at any time, note that this is unrecoverable.',
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
  [lngKeys.ManagePreferences]: 'Manage your preferences.',
  [lngKeys.ManageProfile]: 'Manage your Boost Note profile.',
  [lngKeys.ManageSpaceSettings]: "Manage your space's settings.",
  [lngKeys.ManageTeamMembers]: 'Manage who has access to this space.',
  [lngKeys.ManageIntegrations]:
    'Connect 3rd party content to your Boost Note for Teams documents.',
  [lngKeys.CurrentMembers]: 'Current members',
  [lngKeys.MembersAccessLevel]: 'Access level',
  [lngKeys.AddMembers]: 'Add members',
  [lngKeys.TeamCreate]: 'Create a team space',
  [lngKeys.TeamCreateSubtitle]:
    'Convert to a team space in order to invite your teammates',
  [lngKeys.TeamName]: 'Team name',
  [lngKeys.TeamDomain]: 'Team domain',
  [lngKeys.SpaceName]: 'Space name',
  [lngKeys.SpaceDomain]: 'Space domain',
  [lngKeys.TeamDomainShow]: 'Your url will look like this:',
  [lngKeys.TeamDomainWarning]: "Caution: You can't change it after this step.",
  [lngKeys.InviteWithOpenLink]: 'Invite with an open Link',
  [lngKeys.InviteEmail]: 'Invite with Email',
  [lngKeys.RoleMemberDescription]:
    'Members can access all features, except team management, billing.',
  [lngKeys.RoleAdminDescription]:
    'Admins can handle billing, remove or promote/demote members.',
  [lngKeys.RoleViewerDescription]:
    'Viewers can only navigate through documents, folders, write comments and invite more viewers to the team.',
  [lngKeys.CancelInvite]: 'Cancel invite?',
  [lngKeys.CancelInviteOpenLinkMessage]:
    'Are you sure to cancel this invite? The current links will be depreciated.',
  [lngKeys.CancelInviteEmailMessage]:
    "Are you sure to retract this invite? The user won't be able to join the team anymore.",
  [lngKeys.RoleAdminPromote]:
    "This action will promote {{user}}'s to an admin, they will be granted access to team management and billing information. Are you sure?",
  [lngKeys.RoleMemberChange]:
    "This action will change {{user}}'s role to a regular member, they will be accounted for within the subscription and can actively participate within the team. However they will be unable to access any billing information. Are you sure?",
  [lngKeys.RoleViewerDemote]:
    "This action will change {{user}}'s role to a viewer. They will be removed from the subscription amount. They will be unable to edit in any way folder and documents moving forward but can still read as well as post comments. Are you sure?",
  [lngKeys.TeamLeave]: 'Leave the team',
  [lngKeys.TeamLeaveWarning]:
    'Are you sure to leave the team and not being able to access any of its content anymore? The last team member has to completely delete the team.',
  [lngKeys.RemovingMember]: 'Removing a member',
  [lngKeys.RemovingMemberWarning]:
    'You will be removing {{user}} from this team. Are you sure?',
  [lngKeys.ExternalEntity]: 'External Entity',
  [lngKeys.ExternalEntityOpenInBrowser]: 'Open in browser to enable',
  [lngKeys.ExternalEntityDescription]:
    'Boost Note show you the external content such as Github issues, Trello cards, Google Docs, and much more automatically. What do you want to see on Boost Note?',
  [lngKeys.ExternalEntityRequest]: 'Please let us know your requests!',
  [lngKeys.CommunityFeedback]: 'Feedback',
  [lngKeys.CommunityFeatureRequests]: 'Feature Requests',
  [lngKeys.CommunityFeedbackSubtitle]:
    'Want a specific feature? Did you notice a bug? Let us know!',
  [lngKeys.CommunityBugReport]: 'Bug Report',
  [lngKeys.CommunityFeedbackSendError]: 'Could not send your feedback',
  [lngKeys.CommunityFeedbackSendSuccess]:
    'Your feedback is always appreciated! Thank you for reaching out.',
  [lngKeys.CommunityFeedbackType]: 'Type of Feedback',
  [lngKeys.CommunityFeedbackFreeForm]: 'Free Form',
  [lngKeys.ManageApi]: 'These tokens are available only to {{space}}',
  [lngKeys.AccessTokens]: 'Access Tokens',
  [lngKeys.GenerateToken]: 'Generate Token',
  [lngKeys.CreateTokens]: 'Create a new token',
  [lngKeys.TokensName]: 'Your token name...',
  [lngKeys.TokensDocumentation]: 'documentation for Boost Note for Teams API',

  [lngKeys.FormSelectImage]: 'Select Image',
  [lngKeys.FormChangeImage]: 'Change Image',
  [lngKeys.SupportGuide]: 'Support Guide',
  [lngKeys.SendUsAMessage]: 'Send us a message',
  [lngKeys.KeyboardShortcuts]: 'Keyboard Shortcuts',

  [lngKeys.SettingsSubLimitTrialTitle]: 'Upgrade to go unlimited',
  [lngKeys.SettingsSubLimitTrialDate]:
    "Your workspace's trial of the Pro plan lasts through {{date}}",
  [lngKeys.SettingsSubLimitTrialUpgrade]:
    'You can upgrade at anytime during your trial.',
  [lngKeys.SettingsSubLimitUsed]: '{{docsNb}} docs used',
  [lngKeys.SettingsSubLimitTrialEnd]:
    'Your pro plan trial has ended. Please upgrade now',

  //Language
  [lngKeys.Help]: 'Help',
  [lngKeys.ProfilePicture]: 'Profile Picture',
  [lngKeys.Name]: 'Name',
  [lngKeys.Spaces]: 'spaces',
  [lngKeys.Tabs]: 'tab',
  [lngKeys.Logo]: 'Logo',
  [lngKeys.User]: 'User',
  [lngKeys.Back]: 'Back',
  [lngKeys.Admin]: 'Admin',
  [lngKeys.Member]: 'Member',
  [lngKeys.Viewer]: 'Viewer',
  [lngKeys.See]: 'See',
  [lngKeys.Copy]: 'Copy',
  [lngKeys.Copied]: 'Copied',
  [lngKeys.Send]: 'Send',
  [lngKeys.SendMore]: 'Send More',
  [lngKeys.Leave]: 'Leave',
  [lngKeys.Remove]: 'Remove',
  [lngKeys.Demote]: 'Demote',
  [lngKeys.Promote]: 'Promote',
  [lngKeys.Enable]: 'Enable',
  [lngKeys.Disable]: 'Disable',
  [lngKeys.Show]: 'Show',
  [lngKeys.Hide]: 'Hide',
  [lngKeys.Save]: 'Save',
  [lngKeys.Close]: 'Close',
  [lngKeys.ThisSpace]: 'this space',
  [lngKeys.Token]: 'Token',
}

export default {
  translation: enTranslation,
}
