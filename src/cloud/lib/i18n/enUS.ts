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
  [lngKeys.GeneralTemplates]: 'Templates',
  [lngKeys.GeneralTitle]: 'Title',
  [lngKeys.GeneralUse]: 'Use',
  [lngKeys.GeneralChangeIcon]: 'Change icon',
  [lngKeys.GeneralFolders]: 'Folders',
  [lngKeys.GeneralShowMore]: 'Show more',

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
  [lngKeys.SettingsEditorFontSize]: 'Editor Font Size',
  [lngKeys.SettingsEditorFontFamily]: 'Editor Font Family',
  [lngKeys.SettingsLight]: 'Light',
  [lngKeys.SettingsDark]: 'Dark',
  [lngKeys.SettingsNotifFrequencies]: 'Email updates',
  [lngKeys.SettingsIndentType]: 'Editor Indent Type',
  [lngKeys.SettingsShowEditorToolbar]: 'Editor Toolbar',
  [lngKeys.SettingsIndentSize]: 'Editor Indent Size',
  [lngKeys.SettingsUserForum]: 'User Forum (New!)',
  [lngKeys.ManagePreferences]: 'Manage your preferences.',
  [lngKeys.ManageProfile]: 'Manage your Boost Note profile.',
  [lngKeys.ManageSpaceSettings]: "Manage your space's settings.",
  [lngKeys.ManageTeamMembers]: 'Manage who has access to this space.',
  [lngKeys.ManageIntegrations]:
    'Connect 3rd party content to your Boost Note documents.',
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
  [lngKeys.InviteRoleDetails]: 'Click to see role details.',
  [lngKeys.InviteAddWithLink]: 'Add with link',
  [lngKeys.InviteEmail]: 'Add by Email',
  [lngKeys.InviteByEmailMore]: 'Add another team member',
  [lngKeys.InviteMembersDocAssignButton]: 'Invite members to assign',
  [lngKeys.InviteFailError]:
    'Invite failed because of incorrect email data. Please provide valid email and role.',
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
  [lngKeys.TokensDocumentation]: 'documentation for Boost Note API',

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

  [lngKeys.PlanFreePerk1]: 'Unlimited Viewers',
  [lngKeys.PlanFreePerk2]: '1 Member',
  [lngKeys.PlanFreePerk3]: 'Unlimited documents',
  [lngKeys.PlanStoragePerk]: '{{storageSize}} per member',
  [lngKeys.PlanStandardPerk1]: 'Unlimited members',
  [lngKeys.PlanStandardPerk2]: 'Support development',
  [lngKeys.PlanStandardPerk3]:
    "Last {{days}} days of your docs's revision history",
  [lngKeys.PlanProPerk3]: 'Priority Support',
  [lngKeys.PlanProPerk1]: 'Password and expiration date when sharing',
  [lngKeys.PlanProPerk2]: "Full access to your docs' revision history",
  [lngKeys.PlanTrial]: '{{days}} days free trial',
  [lngKeys.PlanInTrial]: 'In free trial ({{remaining}} left)',
  [lngKeys.PlanSizePerUpload]: '{{size}}Mb per upload',
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
  [lngKeys.CreateNewCanvas]: 'Create new canvas (beta)',
  [lngKeys.UseATemplate]: 'Use a template',
  [lngKeys.RenameFolder]: 'Rename folder',
  [lngKeys.RenameDoc]: 'Rename doc',
  [lngKeys.ModalsCreateNewFolder]: 'Create a new folder',
  [lngKeys.ModalsCreateNewDocument]: 'Create a new document',

  [lngKeys.ModalsDeleteWorkspaceTitle]: 'Delete the folder',
  [lngKeys.ModalsDeleteWorkspaceDisclaimer]:
    'Are you sure to delete this folder? You will not be able to revert this action.',

  [lngKeys.ModalsDeleteDocFolderTitle]: 'Delete {{label}}',
  [lngKeys.ModalsDeleteDocDisclaimer]:
    'Are you sure to remove this document permanently?',
  [lngKeys.ModalsDeleteFolderDisclaimer]:
    'Are you sure to remove this folder and delete completely its documents?',

  [lngKeys.ModalsWorkspaceCreateTitle]: 'Create a folder',
  [lngKeys.ModalsWorkspaceEditTitle]: 'Edit your folder',

  [lngKeys.ModalsWorkspaceMakePrivate]: 'Make private',
  [lngKeys.ModalsWorkspaceAccess]: 'Access',
  [lngKeys.ModalsWorkspaceDefaultDisclaimer]:
    "This default workspace is public and can't have its access modified.",
  [lngKeys.ModalsWorkspacePublicDisclaimer]:
    'This workspace is public. Anyone from the team can access it.',
  [lngKeys.ModalsWorkspacePrivateDisclaimer]: 'This folder is private.',
  [lngKeys.ModalsWorkspacePrivateOwner]:
    'You can set individual member access below.',

  [lngKeys.ModalsWorkspaceSetAccess]: 'Set access',
  [lngKeys.ModalsWorkspacesSetAccessMembers]: 'Add members',
  [lngKeys.GeneralOwner]: 'Owner',
  [lngKeys.GeneralAddVerb]: 'Add',
  [lngKeys.GeneralSelectAll]: 'Select all',
  [lngKeys.ModalsWorkspacesWhoHasAcess]: 'Who has access',
  [lngKeys.ModalsWorkspacesNonOwnerDisclaimer]:
    'Only the folder owner can change its access.',

  [lngKeys.ModalsImportDestinationTitle]: 'Select a folder',
  [lngKeys.ModalsImportDestinationDisclaimer]:
    'Pick the folder you want your documents to be imported in',
  [lngKeys.ModalsImportDisclaimer]:
    'Select how you want to import files ( 5Mb max per file )',

  [lngKeys.ModalsSmartFolderCreateTitle]: 'Create a smart folder',
  [lngKeys.ModalsSmartFolderEditTitle]: 'Edit a smart folder',
  [lngKeys.ModalsSmartFolderPrivateDisclaimer]:
    'This smart folder will become private. Only you can see it.',
  [lngKeys.ModalsSmartFolderPublicDisclaimer]:
    'The smart folder will become public. Every member can see it.',

  [lngKeys.EditorToolbarTooltipHeader]: 'Add header text',
  [lngKeys.EditorToolbarTooltipAdmonition]: 'Add admonition',
  [lngKeys.EditorToolbarTooltipCodefence]: 'Insert a codefence',
  [lngKeys.EditorToolbarTooltipQuote]: 'Insert a quote',
  [lngKeys.EditorToolbarTooltipList]: 'Add a bulleted list',
  [lngKeys.EditorToolbarTooltipNumberedList]: 'Add a numbered list',
  [lngKeys.EditorToolbarTooltipTaskList]: 'Add a task list',
  [lngKeys.EditorToolbarTooltipBold]: 'Add bold text',
  [lngKeys.EditorToolbarTooltipItalic]: 'Add italic text',
  [lngKeys.EditorToolbarTooltipCode]: 'Insert code',
  [lngKeys.EditorToolbarTooltipLink]: 'Add a link',
  [lngKeys.EditorToolbarTooltipUpload]: 'Upload Image',
  [lngKeys.EditorToolbarTooltipTemplate]: 'Use a template',
  [lngKeys.EditorToolbarTooltipScrollSyncEnable]: 'Enable scroll sync',
  [lngKeys.EditorToolbarTooltipScrollSyncDisable]: 'Disable scroll sync',

  [lngKeys.EditorReconnectAttempt]: 'Connecting...',
  [lngKeys.EditorReconnectAttempt1]: 'Attempting auto-reconnection',
  [lngKeys.EditorReconnectAttempt2]:
    'Changes will not be synced with the server until reconnection',
  [lngKeys.EditorReconnectDisconnected]: 'Reconnect',
  [lngKeys.EditorReconnectDisconnected1]: 'Please try reconnecting.',
  [lngKeys.EditorReconnectDisconnected2]:
    'Changes will not be synced with the server until reconnection',
  [lngKeys.EditorReconnectSyncing]: 'Syncing...',
  [lngKeys.EditorReconnectSyncing1]: 'Syncing with the cloud.',
  [lngKeys.EditorReconnectSyncing2]:
    'Checking for changes and live updating the document',

  [lngKeys.DocSaveAsTemplate]: 'Save as a template',
  [lngKeys.DocExportPdf]: 'Export as PDF',
  [lngKeys.DocExportMarkdown]: 'Export as Markdown',
  [lngKeys.DocExportHtml]: 'Export as HTML',
  [lngKeys.OpenInBrowser]: 'Open in browser',
  [lngKeys.GeneralPickYourDestination]: 'Pick your destination',

  [lngKeys.AttachmentsDeleteDisclaimer]:
    "Are you sure to delete this file? It won't be visible in your document anymore.",
  [lngKeys.AttachmentsLimitDisclaimer]: '{{current}} of {{limit}} used.',
  [lngKeys.AttachmentsPlanUpgradeDisclaimer]: 'If you need more space, please',
  [lngKeys.AttachmentsUpgradeLink]: 'upgrade your plan.',

  [lngKeys.FolderInfo]: 'Folder Info',
  [lngKeys.DocInfo]: 'Doc Info',
  [lngKeys.Assignees]: 'Assignees',
  [lngKeys.Unassigned]: 'Unassigned',
  [lngKeys.DueDate]: 'Due Date',
  [lngKeys.AddDueDate]: 'Add due date',
  [lngKeys.AddALabel]: 'Add a label',
  [lngKeys.NoStatus]: 'No Status',
  [lngKeys.CreationDate]: 'Creation Date',
  [lngKeys.UpdateDate]: 'Update Date',
  [lngKeys.CreatedBy]: 'Created By',
  [lngKeys.UpdatedBy]: 'Updated By',
  [lngKeys.Contributors]: 'Contributors',
  [lngKeys.History]: 'History',
  [lngKeys.Share]: 'Share',
  [lngKeys.PublicSharing]: 'Public Sharing',
  [lngKeys.PublicSharingDisclaimer]: 'Anyone with this link can access',
  [lngKeys.SharingSettings]: 'Sharing settings',
  [lngKeys.SharingRegenerateLink]: 'Regenerate link',
  [lngKeys.Regenerate]: 'regenerate',
  [lngKeys.PasswordProtect]: 'password protect',
  [lngKeys.ExpirationDate]: 'expiration date',
  [lngKeys.SeeFullHistory]: 'See full history',
  [lngKeys.SeeLimitedHistory]: 'See last {{days}} days',
  [lngKeys.ThreadsTitle]: 'Threads',
  [lngKeys.ThreadPost]: 'Post',
  [lngKeys.ThreadFullDocLabel]: 'Full doc thread',
  [lngKeys.ThreadCreate]: 'Create a new thread',
  [lngKeys.ThreadOpen]: 'Open',
  [lngKeys.ThreadClosed]: 'Closed',
  [lngKeys.ThreadOutdated]: 'Outdated',
  [lngKeys.ThreadReopen]: 'Reopen',
  [lngKeys.ThreadReplies]: '{{count}} replies',
  [lngKeys.ModalsTemplatesDeleteDisclaimer]: `Are you sure to delete this template?`,
  [lngKeys.ModalsTemplatesSearchEmpty]: 'Could not find any template',
  [lngKeys.ModalsTemplatesSelectTemplate]: 'Select a template',
  [lngKeys.ModalsTemplatesUseInDoc]: 'Use in your doc',
  [lngKeys.GeneralAll]: 'All',
  [lngKeys.GeneralAny]: 'Any',

  //Language
  [lngKeys.GeneralSelectVerb]: 'Select',
  [lngKeys.GeneralOpenVerb]: 'Open',
  [lngKeys.GeneralCopyTheLink]: 'Copy the link',
  [lngKeys.GeneralMoveVerb]: 'Move',
  [lngKeys.GeneralSource]: 'Source',
  [lngKeys.GeneralDestination]: 'Destination',
  [lngKeys.GeneralPrevious]: 'Previous',
  [lngKeys.GeneralNext]: 'Next',
  [lngKeys.GeneralContinueVerb]: 'Continue',
  [lngKeys.GeneralShared]: 'Shared',
  [lngKeys.GeneralRenameVerb]: 'Rename',
  [lngKeys.GeneralEditVerb]: 'Edit',
  [lngKeys.GeneralBookmarks]: 'Bookmarks',
  [lngKeys.GeneralUnbookmarkVerb]: 'Remove from Bookmarks',
  [lngKeys.GeneralBookmarkVerb]: 'Add to bookmarks',
  [lngKeys.GeneralSmartFolders]: 'Smart Folders',
  [lngKeys.GeneralWorkspaces]: 'Workspaces',
  [lngKeys.GeneralPrivate]: 'Private',
  [lngKeys.GeneralLabels]: 'Labels',
  [lngKeys.GeneralMore]: 'More',
  [lngKeys.GeneralStatus]: 'Status',
  [lngKeys.GeneralMembers]: 'Members',
  [lngKeys.GeneralSettings]: 'Settings',
  [lngKeys.GeneralTimeline]: 'Timeline',
  [lngKeys.GeneralImport]: 'Import',
  [lngKeys.GeneralSearchVerb]: 'Search',
  [lngKeys.GeneralHelp]: 'Help',
  [lngKeys.GeneralProfilePicture]: 'Profile Picture',
  [lngKeys.GeneralName]: 'Name',
  [lngKeys.GeneralSpaces]: 'spaces',
  [lngKeys.GeneralTabs]: 'tab',
  [lngKeys.GeneralLogo]: 'Logo',
  [lngKeys.GeneralUser]: 'User',
  [lngKeys.GeneralBack]: 'Back',
  [lngKeys.GeneralAdmin]: 'Admin',
  [lngKeys.GeneralMember]: 'Member',
  [lngKeys.GeneralViewer]: 'Viewer',
  [lngKeys.GeneralSeeVerb]: 'See',
  [lngKeys.GeneralCopyVerb]: 'Copy',
  [lngKeys.GeneralCopied]: 'Copied',
  [lngKeys.GeneralSendVerb]: 'Send',
  [lngKeys.GeneralSendMore]: 'Send More',
  [lngKeys.GeneralLeaveVerb]: 'Leave',
  [lngKeys.GeneralRemoveVerb]: 'Remove',
  [lngKeys.GeneralDemoteVerb]: 'Demote',
  [lngKeys.GeneralPromoteVerb]: 'Promote',
  [lngKeys.GeneralEnableVerb]: 'Enable',
  [lngKeys.GeneralDisableVerb]: 'Disable',
  [lngKeys.GeneralShowVerb]: 'Show',
  [lngKeys.GeneralHideVerb]: 'Hide',
  [lngKeys.GeneralSaveVerb]: 'Save',
  [lngKeys.GeneralCloseVerb]: 'Close',
  [lngKeys.GeneralThisSpace]: 'this space',
  [lngKeys.GeneralToken]: 'Token',
  [lngKeys.GeneralApplyVerb]: 'Apply',
  [lngKeys.GeneralUpdateVerb]: 'Update',
  [lngKeys.GeneralLearnMore]: 'Learn More',
  [lngKeys.GeneralDoYouWishToProceed]: 'Do you wish to proceed?',
  [lngKeys.GeneralDays]: 'days',
  [lngKeys.GeneralHours]: 'hours',
  [lngKeys.GeneralMinutes]: 'minutes',
  [lngKeys.GeneralSeconds]: 'seconds',
  [lngKeys.GeneralOrdering]: 'Ordering',
  [lngKeys.SidebarViewOptions]: 'View Options',
  [lngKeys.SidebarSettingsAndMembers]: 'Settings & Members',
  [lngKeys.GeneralInbox]: 'Inbox',
  [lngKeys.SidebarNewUserDiscount]: 'Get the new user discount!',
  [lngKeys.SettingsImportDescription]:
    'No need to start from scratch. Import data into Boost Note by selecting one of the options below.',

  [lngKeys.GeneralPassword]: 'Password',

  [lngKeys.CooperateTitle]: 'Create a new space',
  [lngKeys.CooperateSubtitle]: 'Please set up your space information',
  [lngKeys.PictureAdd]: 'Add a picture',
  [lngKeys.PictureChange]: 'Change your picture',
  [lngKeys.SpaceIntent]: 'For what purpose are you going to use this space?',
  [lngKeys.SpaceIntentPersonal]: 'For my personal use',
  [lngKeys.SpaceIntentTeam]: 'To collaborate with my team',
  [lngKeys.PlanViewersMembersIntro]:
    "What's the difference between viewers and members? Please take a look at",
  [lngKeys.PlanViewersMembersLink]: 'this article',
  [lngKeys.SeeRoleDetails]: 'See role details',

  [lngKeys.ViewerDisclaimerIntro]: 'Please ask your admin to give you a ',
  [lngKeys.ViewerDisclaimerOutro]: 'so that you can edit this document',
  [lngKeys.MemberRole]: 'Member role',

  [lngKeys.DiscountModalTitle]: 'Subscribe now to receive a discount',
  [lngKeys.DiscountModalAlreadySubscribed]: 'You are already subscribed',
  [lngKeys.DiscountModalTimeRemaining]: 'Time remaining',
  [lngKeys.DiscountModalExpired]: 'Your eligibility for a discount has expired',
  [lngKeys.GeneralInvite]: 'Invite',
  [lngKeys.SettingsRolesRestrictedTitle]: 'This role is restricted',
  [lngKeys.SettingsRolesRestrictedDescription]:
    'In order to promote the user to this specific role, your space needs to have an active subscription. Please consider upgrading your plan.',

  [lngKeys.GeneralDocuments]: 'Documents',
  [lngKeys.RequestSent]: 'Request sent',
  [lngKeys.RequestAskMemberRole]: 'Ask Member role',
  [lngKeys.UploadLimit]:
    'The maximum allowed size for uploads is {{sizeInMb}}Mb',

  [lngKeys.OnboardingFolderSectionTitle]: 'Welcome to Boost Note!',
  [lngKeys.OnboardingFolderSectionDisclaimer]:
    'Invite your teammates to this space',

  [lngKeys.GeneralContent]: 'Content',
}

export default {
  translation: enTranslation,
}
