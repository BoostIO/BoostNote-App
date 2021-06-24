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
  [lngKeys.SettingsSubLimitUnderFreePlan]:
    'Under the free plan, you can create up to {{limit}} docs.',

  [lngKeys.PlanChoose]: 'Choose your plan.',
  [lngKeys.PlanDiscountUntil]:
    'You will receive a discount as long as you subscribe before ',
  [lngKeys.PlanDiscountDetail]: '{{off}}% OFF for {{month}} month',
  [lngKeys.PlanDiscountLabel]: '{{month}} month discount',
  [lngKeys.PlanDiscountCouponWarning]:
    'Applying a promotion code will prevent you to receive other discounts',
  [lngKeys.PlanBusinessIntro]:
    'For larger businesses or those in highly regulated industries, please',
  [lngKeys.PlanBusinessLink]: 'contact our sales department',
  [lngKeys.PlanPerMember]: 'per member',
  [lngKeys.PlanPerMonth]: 'per month',
  [lngKeys.PlanFreePerk1]: 'Unlimited members',
  [lngKeys.PlanFreePerk2]: '{{docs}} docs per team',
  [lngKeys.PlanStoragePerk]: '{{storageSize}} per member',
  [lngKeys.PlanStandardPerk1]: '{{viewersSize}} viewers for free',
  [lngKeys.PlanStandardPerk2]: 'Support development',
  [lngKeys.PlanStandardPerk3]: 'Unlimited documents',
  [lngKeys.PlanStandardPerk4]:
    "Last {{days}} days of your docs's revision history",
  [lngKeys.PlanProPerk1]: 'Unlimited viewers for free',
  [lngKeys.PlanProPerk2]: 'Password and expiration date when sharing',
  [lngKeys.PlanProPerk3]: "Full access to your docs' revision history",
  [lngKeys.PlanTrial]: '{{days}} days free trial',
  [lngKeys.PlanInTrial]: 'In free trial ({{remaining}} left)',
  [lngKeys.UpgradeSubtitle]: 'Confirm and enter your payment information',
  [lngKeys.Viewers]: 'viewers',
  [lngKeys.Month]: 'month',
  [lngKeys.TotalMonthlyPrice]: 'Total Monthly Price',
  [lngKeys.PaymentMethod]: 'Payment Method',
  [lngKeys.TrialWillBeStopped]: 'Your free trial will be stopped',
  [lngKeys.ApplyCoupon]: 'Apply a coupon',
  [lngKeys.PromoCode]: 'Promo Code',
  [lngKeys.Subscribe]: 'Subscribe',
  [lngKeys.PaymentMethodJpy]:
    'We can only accept JPY(Japanese Yen) when paying by JCB cards.',
  [lngKeys.UnlimitedViewers]: 'Unlimited viewers',

  [lngKeys.BillingActionRequired]: 'Your payment may require action!',
  [lngKeys.BillingHistory]: 'Billing History',
  [lngKeys.BillingHistoryCheck]:
    'Please check your billing history to handle any unpaid or failed charges.',
  [lngKeys.BillingCancelledAt]:
    'Your subscription will be canceled on {{date}} upon reception of your last invoice.',
  [lngKeys.BillingToCard]:
    'Will bill to the credit card ending in {{cardEnd}} at {{date}}.',
  [lngKeys.BillingEditCard]: 'Edit Card',
  [lngKeys.BillingEmail]: 'Billing email is {{email}}',
  [lngKeys.BillingEditEmail]: 'Edit Email',
  [lngKeys.BillingCanSeeThe]: 'You can see the ',
  [lngKeys.BillingChangePlan]: 'Change plans',
  [lngKeys.BillingUpdateCard]: 'Update your Credit Card',
  [lngKeys.BillingCurrentCard]: 'Current Credit Card',
  [lngKeys.BillingUpdateEmail]: 'Update your billing email',
  [lngKeys.BillingCurrentEmail]: 'Current Email',
  [lngKeys.BillingChangeJCB]:
    'Switching payment method from/to JCB card requires canceling existing active subscription. Please cancel the existing one and subscribe again with a new card.',
  [lngKeys.BillingApplyPromoWarning]:
    'Applying a promotion code will end your current discount',
  [lngKeys.BillingApplyPromo]: 'Apply a promotion code',

  [lngKeys.BillingChangePlanDiscountStop]:
    'Changing plans will end your current discount.',
  [lngKeys.BillingChangePlanStripeProration]:
    "The fee change is handled via Stripe's proration.",
  [lngKeys.BillingChangePlanFreeDisclaimer]:
    'You will lose access immediately to advanced features such as unlimited documents, document revision history, bigger storage size etc...',
  [lngKeys.BillingChangePlanProDisclaimer]:
    'You will get access to advanced features such as unlimited document revision history, setting password and expiration date for shared documents, unlimited viewers etc...',
  [lngKeys.BillingChangePlanStandardDisclaimer]:
    'You will lose access to advanced features such as unlimited document revision history, setting password and expiration date for shared document, unlimited viewers, etc...',

  [lngKeys.DiscountModalTitle]: 'Subscribe now to receive a discount!',
  [lngKeys.DiscountModalAlreadySubscribed]: 'You are already subscribed',
  [lngKeys.DiscountModalTimeRemaining]: 'Time remaining',
  [lngKeys.DiscountModalExpired]: 'Your eligibility for a discount has expired',

  [lngKeys.FreeTrialModalTitle]: 'Try the Pro Plan for free',
  [lngKeys.FreeTrialModalBody]:
    "You'll get access to most features of a paid Pro Plan such as unlimited documents, revision history, etc... for {{days}} days.",
  [lngKeys.FreeTrialModalDisclaimer]:
    'No credit card information is necessary for now.',
  [lngKeys.FreeTrialModalCTA]: 'Start Free Trial',

  [lngKeys.LogOut]: 'Log out',
  [lngKeys.CreateNewSpace]: 'Create a new space',
  [lngKeys.DownloadDesktopApp]: 'Download the desktop app',

  [lngKeys.ToolbarTooltipsSpaces]: 'Spaces',
  [lngKeys.ToolbarTooltipsTree]: 'Tree',
  [lngKeys.ToolbarTooltipsDiscount]: 'Get the new user discount',

  [lngKeys.FolderNamePlaceholder]: 'Folder name...',
  [lngKeys.DocTitlePlaceholder]: 'Doc title...',

  [lngKeys.SortLastUpdated]: 'Last Updated',
  [lngKeys.SortTitleAZ]: 'Title A-Z',
  [lngKeys.SortTitleZA]: 'Title Z-A',
  [lngKeys.SortDragAndDrop]: 'Drag and Drop',
  [lngKeys.CreateNewDoc]: 'Create new doc',
  [lngKeys.UseATemplate]: 'Use a template',
  [lngKeys.RenameFolder]: 'Rename folder',
  [lngKeys.RenameDoc]: 'Rename doc',
  [lngKeys.ModalsCreateNewFolder]: 'Create a new folder',
  [lngKeys.ModalsCreateNewDocument]: 'Create a new document',

  [lngKeys.ModalsDeleteWorkspaceTitle]: 'Delete the workspace',
  [lngKeys.ModalsDeleteWorkspaceDisclaimer]:
    'Are you sure to delete this workspace? You will not be able to revert this action.',

  [lngKeys.ModalsDeleteDocFolderTitle]: 'Delete {{label}}',
  [lngKeys.ModalsDeleteDocDisclaimer]:
    'Are you sure to remove this document permanently?',
  [lngKeys.ModalsDeleteFolderDisclaimer]:
    'Are you sure to remove this folder and delete completely its documents?',

  [lngKeys.ModalsWorkspaceCreateTitle]: 'Create a workspace',
  [lngKeys.ModalsWorkspaceEditTitle]: 'Edit your workspace',

  [lngKeys.ModalsWorkspaceMakePrivate]: 'Make private',
  [lngKeys.ModalsWorkspaceAccess]: 'Access',
  [lngKeys.ModalsWorkspaceDefaultDisclaimer]:
    "This default workspace is public and can't have its access modified.",
  [lngKeys.ModalsWorkspacePublicDisclaimer]:
    'This workspace is public. Anyone from the team can access it.',
  [lngKeys.ModalsWorkspacePrivateDisclaimer]: 'This workspace is private.',
  [lngKeys.ModalsWorkspacePrivateOwner]:
    'You can set individual member access below.',

  [lngKeys.ModalsWorkspaceSetAccess]: 'Set access',
  [lngKeys.ModalsWorkspacesSetAccessMembers]: 'Add members',
  [lngKeys.Owner]: 'Owner',
  [lngKeys.Add]: 'Add',
  [lngKeys.SelectAll]: 'Select all',
  [lngKeys.ModalsWorkspacesWhoHasAcess]: 'Who has access',
  [lngKeys.ModalsWorkspacesNonOwnerDisclaimer]:
    'Only the workspace owner can change its access.',

  //Language
  [lngKeys.Shared]: 'Shared',
  [lngKeys.Rename]: 'Rename',
  [lngKeys.Edit]: 'Edit',
  [lngKeys.Bookmarks]: 'Bookmarks',
  [lngKeys.Bookmarked]: 'Bookmarked',
  [lngKeys.BookmarkVerb]: 'Bookmark',
  [lngKeys.SmartFolders]: 'Smart Folders',
  [lngKeys.Workspaces]: 'Workspaces',
  [lngKeys.Private]: 'Private',
  [lngKeys.Labels]: 'Labels',
  [lngKeys.More]: 'More',
  [lngKeys.Status]: 'Status',
  [lngKeys.Members]: 'Members',
  [lngKeys.Settings]: 'Settings',
  [lngKeys.Timeline]: 'Timeline',
  [lngKeys.Import]: 'Import',
  [lngKeys.Search]: 'Search',
  [lngKeys.members]: 'members',
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
  [lngKeys.Apply]: 'Apply',
  [lngKeys.Update]: 'Update',
  [lngKeys.LearnMore]: 'Learn More',
  [lngKeys.DoYouWishToProceed]: 'Do you wish to proceed?',
  [lngKeys.days]: 'days',
  [lngKeys.hours]: 'hours',
  [lngKeys.minutes]: 'minutes',
  [lngKeys.seconds]: 'seconds',
}

export default {
  translation: enTranslation,
}
