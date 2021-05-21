export enum MixpanelActionTrackTypes {
  AccountCreate = 'account.create',
  AccountDelete = 'account.delete',
  BlockCreate = 'block.create',
  BlockEdit = 'block.edit',
  BlockDelete = 'block.delete',
  DocArchive = 'doc.archive',
  DocBookmarkCreate = 'doc.bookmark.create',
  DocBookmarkDelete = 'doc.bookmark.delete',
  DocCreate = 'doc.create',
  DocDelete = 'doc.delete',
  DocEdit = 'doc.edit',
  DocEmoji = 'doc.emoji',
  DocFeatureRevision = 'doc.feature.revision',
  DocFeatureSharePassword = 'doc.feature.share.password',
  DocFeatureShareExpirationDate = 'doc.feature.share.expiration.date',
  DocImport = 'doc.import',
  DocLayoutEdit = 'doc.layout.edit',
  DocOpen = 'doc.open',
  DocUnarchive = 'doc.unarchive',
  DocShareCreate = 'doc.share.create',
  DocTagAdd = 'doc.tags.add',
  GuestCreate = 'guest.create',
  GuestDelete = 'guest.delete',
  GuestInviteCreate = 'guest.invite.create',
  GuestInviteDelete = 'guest.invite.delete',
  ExportHtml = 'doc.export.html',
  ExportMd = 'doc.export.md',
  ExportPdf = 'doc.export.pdf',
  FolderBookmarkCreate = 'folder.bookmark.create',
  FolderBookmarkDelete = 'folder.bookmark.delete',
  FolderCreate = 'folder.create',
  FolderDelete = 'folder.delete',
  FolderEmoji = 'folder.emoji',
  FolderOpen = 'folder.open',
  ImageUpload = 'image.upload',
  InviteCreate = 'invite.create',
  InviteDelete = 'invite.delete',
  HelpOpen = 'help.open',
  MemberCreate = 'member.create',
  MemberDelete = 'member.delete',
  MemberUpdate = 'member.update',
  OnboardingContentOpen = 'onboarding.content.open',
  OpenInviteCreate = 'invite.open.create',
  OpenInviteDelete = 'invite.open.delete',
  OpenInviteReset = 'invite.open.reset',
  PersonalCreate = 'personal.create',
  RevisionHistoryOpen = 'revision.history.open',
  SearchOpen = 'search.open',
  SubscriptionStart = 'subscription.start',
  SubscriptionCancel = 'subscription.cancel',
  SubscriptionTrialStart = 'subscription.trial.sart',
  SubscriptionTrialEnd = 'subscription.trial.end',
  TeamCreate = 'team.create',
  TeamDelete = 'team.delete',
  ThemeChangeApp = 'theme.change.app',
  ThemeChangeEditor = 'theme.change.editor',
  ThemeChangeCodeblock = 'theme.change.codeblock',
  ThemeChangeKeymap = 'theme.change.keymap',
  ThemeChangeIndentSize = 'theme.change.indent.size',
  ThemeChangeIndentType = 'theme.change.indent.type',
  TemplateCreate = 'template.create',
  TemplateEdit = 'templete.edit',
  TemplateDelete = 'template.delete',
  TemplateUse = 'template.use',
  TimelineOpen = 'timeline.open',
  TokenCreate = 'token.create',
  TokenUpdate = 'token.update',
  TokenDelete = 'token.delete',
  UpgradePassword = 'upgrade.origin.password',
  UpgradeExpirationDate = 'upgrade.origin.expiration.date',
  UpgradeRevision = 'upgrade.origin.revision',
  UpgradeGuest = 'upgrade.origin.guest',
  UpgradeLimit = 'upgrade.origin.limit',
  UpgradeDiscount = 'upgrade.origin.discount',
  WorkspaceOpen = 'workspace.open',
  WorkspaceCreate = 'workspace.create',
  WorkspaceDelete = 'workspace.delete',
  ZapierLinkOpen = 'zapier.link.open',
}

export type MixpanelFrontEvent =
  | MixpanelActionTrackTypes.RevisionHistoryOpen
  | MixpanelActionTrackTypes.ThemeChangeApp
  | MixpanelActionTrackTypes.ThemeChangeCodeblock
  | MixpanelActionTrackTypes.ThemeChangeEditor
  | MixpanelActionTrackTypes.ZapierLinkOpen
  | MixpanelActionTrackTypes.TemplateUse
  | MixpanelActionTrackTypes.SearchOpen
  | MixpanelActionTrackTypes.ThemeChangeKeymap
  | MixpanelActionTrackTypes.ThemeChangeIndentSize
  | MixpanelActionTrackTypes.ThemeChangeIndentType
  | MixpanelActionTrackTypes.HelpOpen
  | MixpanelActionTrackTypes.ExportMd
  | MixpanelActionTrackTypes.ExportPdf
  | MixpanelActionTrackTypes.ExportHtml
  | MixpanelActionTrackTypes.DocLayoutEdit
  | MixpanelActionTrackTypes.UpgradeExpirationDate
  | MixpanelActionTrackTypes.UpgradeGuest
  | MixpanelActionTrackTypes.UpgradeLimit
  | MixpanelActionTrackTypes.UpgradePassword
  | MixpanelActionTrackTypes.UpgradeRevision
  | MixpanelActionTrackTypes.DocFeatureRevision
  | MixpanelActionTrackTypes.UpgradeDiscount

export type MixpanelUserEvent = MixpanelActionTrackTypes.AccountDelete

export type MixpanelTemplateEvent =
  | MixpanelActionTrackTypes.TemplateCreate
  | MixpanelActionTrackTypes.TemplateDelete
  | MixpanelActionTrackTypes.TemplateEdit

export type MixpanelTeamEvent =
  | MixpanelActionTrackTypes.TeamCreate
  | MixpanelActionTrackTypes.TeamDelete
  | MixpanelActionTrackTypes.PersonalCreate
  | MixpanelActionTrackTypes.SubscriptionStart
  | MixpanelActionTrackTypes.SubscriptionCancel
  | MixpanelActionTrackTypes.SubscriptionTrialStart
  | MixpanelActionTrackTypes.SubscriptionTrialEnd

export type MixpanelDocEvent =
  | MixpanelActionTrackTypes.DocOpen
  | MixpanelActionTrackTypes.DocCreate
  | MixpanelActionTrackTypes.DocEdit
  | MixpanelActionTrackTypes.DocDelete
  | MixpanelActionTrackTypes.DocTagAdd
  | MixpanelActionTrackTypes.DocBookmarkCreate
  | MixpanelActionTrackTypes.DocBookmarkDelete
  | MixpanelActionTrackTypes.DocShareCreate
  | MixpanelActionTrackTypes.DocArchive
  | MixpanelActionTrackTypes.DocUnarchive
  | MixpanelActionTrackTypes.DocEmoji

export type MixpanelInviteEvent =
  | MixpanelActionTrackTypes.InviteCreate
  | MixpanelActionTrackTypes.InviteDelete

export type MixpanelWorkspaceEvent =
  | MixpanelActionTrackTypes.WorkspaceOpen
  | MixpanelActionTrackTypes.WorkspaceCreate
  | MixpanelActionTrackTypes.WorkspaceDelete

export type MixpanelFolderEvent =
  | MixpanelActionTrackTypes.FolderOpen
  | MixpanelActionTrackTypes.FolderCreate
  | MixpanelActionTrackTypes.FolderDelete
  | MixpanelActionTrackTypes.FolderEmoji
  | MixpanelActionTrackTypes.FolderBookmarkCreate
  | MixpanelActionTrackTypes.FolderBookmarkDelete

export type MixpanelBlockEvent =
  | MixpanelActionTrackTypes.BlockCreate
  | MixpanelActionTrackTypes.BlockEdit
  | MixpanelActionTrackTypes.BlockDelete

export type MixpanelOpenInviteEvent =
  | MixpanelActionTrackTypes.OpenInviteCreate
  | MixpanelActionTrackTypes.OpenInviteDelete
  | MixpanelActionTrackTypes.OpenInviteReset

export type MixpanelUserProfile = {
  $first_name?: string
  $last__name?: string
  $created?: string
  $email?: string
}
