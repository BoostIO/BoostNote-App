export enum MixpanelActionTrackTypes {
  AccountCreate = 'account.create',
  AccountDelete = 'account.delete',
  DiscountSidebar = 'discount.sidebar',
  DocArchive = 'doc.archive',
  DocBookmarkCreate = 'doc.bookmark.create',
  DocBookmarkDelete = 'doc.bookmark.delete',
  DocCreate = 'doc.create',
  DocDelete = 'doc.delete',
  DocDueDateAdd = 'doc.duedate.add',
  DocEdit = 'doc.edit',
  DocEmoji = 'doc.emoji',
  DocFeatureRevision = 'doc.feature.revision',
  DocFeatureSharePassword = 'doc.feature.share.password',
  DocFeatureShareExpirationDate = 'doc.feature.share.expiration.date',
  DocImport = 'doc.import',
  DocAssigneesAdd = 'doc.assignees.add',
  DocAssigneesRemove = 'doc.assignees.remove',
  DocStatusClear = 'doc.status.clear',
  DocStatusPaused = 'doc.status.paused',
  DocStatusInProgress = 'doc.status.inprogress',
  DocStatusArchived = 'doc.status.archived',
  DocStatusCompleted = 'doc.status.completed',
  DocLayoutEdit = 'doc.layout.edit',
  DocOpen = 'doc.open',
  DocUnarchive = 'doc.unarchive',
  DocShareCreate = 'doc.share.create',
  DocTagAdd = 'doc.tags.add',
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
  SmartViewCreate = 'dashboard.smart-views.create',
  SmartViewUpdateName = 'dashboard.smart-views.update',
  SmartViewUpdateFilter = 'dashboard.smart-views.filter',
  SmartViewDestroy = 'dashboard.smart-views.delete',
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
  UpgradeLimit = 'upgrade.origin.limit',
  UpgradeDiscount = 'upgrade.origin.discount',
  WorkspaceOpen = 'workspace.open',
  WorkspaceCreate = 'workspace.create',
  WorkspaceDelete = 'workspace.delete',
  ZapierLinkOpen = 'zapier.link.open',
  DocCommentThreadCreate = 'doc.thread.add',
  DocCommentThreadEdit = 'doc.thread.edit',
  DocCommentThreadDelete = 'doc.thread.delete',
  LineCommentThreadCreate = 'line.thread.create',
  LineCommentThreadEdit = 'line.thread.edit',
  LineCommentThreadDelete = 'line.thread.delete',
  CommentCreate = 'comment.create',
  CommentUpdate = 'comment.update',
  CommentDelete = 'comment.delete',
  ViewerCreate = 'viewer.create',
  IntegrationCreateSlack = 'slack.integration',
  UserIntentPersonal = 'user.intent.personal',
  UserIntentTeam = 'user.intent.team',
  SpaceIntentPersonal = 'space.intent.personal',
  SpaceIntentTeam = 'space.intent.team',
  InviteFromDocPage = 'invite.doc',
  InviteFromFolderPage = 'invite.folder',
  InviteFromSidenav = 'invite.sidenav',
  SendEditRequest = 'send.editrequest',
  DocPropsUpdated = 'doc.props.update',
  DashboardOpen = 'dashboard.open',
  DocPropAdd = 'doc.props.add',
  DocPropUpdateName = 'doc.props.update.name',
  DocPropUpdateType = 'doc.props.update.type',
  DocPropUpdateValue = 'doc.props.update.value',
  DocPropDelete = 'doc.prop.delete',
  TableColAdd = 'table.cols.add',
  TableColDelete = 'table.cols.delete',
  TableColUpdateOrder = 'table.cols.update.order',
  ViewCreate = 'view.create',
  ViewEdit = 'view.edit',
  ViewDelete = 'view.delete',
  ViewOpen = 'view.open',
  DashboardCreate = 'dashboard.create',
  DashboardEdit = 'dashboard.edit',
  DashboardDelete = 'dashboard.delete',
  WorkflowCreate = 'workflow.create',
  WorkflowDelete = 'workflow.delete',
  WorkflowUpdate = 'workflow.update',
  AutomationCreate = 'automation.create',
  AutomationDelete = 'automation.delete',
  AutomationUpdate = 'automation.update',
}

export type MixpanelViewEvent =
  | MixpanelActionTrackTypes.ViewCreate
  | MixpanelActionTrackTypes.ViewEdit
  | MixpanelActionTrackTypes.ViewDelete
  | MixpanelActionTrackTypes.ViewOpen

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
  | MixpanelActionTrackTypes.UpgradeLimit
  | MixpanelActionTrackTypes.UpgradePassword
  | MixpanelActionTrackTypes.UpgradeRevision
  | MixpanelActionTrackTypes.DocFeatureRevision
  | MixpanelActionTrackTypes.UserIntentPersonal
  | MixpanelActionTrackTypes.UserIntentTeam
  | MixpanelActionTrackTypes.SpaceIntentPersonal
  | MixpanelActionTrackTypes.SpaceIntentTeam
  | MixpanelActionTrackTypes.InviteFromDocPage
  | MixpanelActionTrackTypes.InviteFromFolderPage
  | MixpanelActionTrackTypes.InviteFromSidenav
  | MixpanelActionTrackTypes.DiscountSidebar
  | MixpanelActionTrackTypes.SendEditRequest
  | MixpanelActionTrackTypes.DashboardOpen
  | MixpanelActionTrackTypes.DocPropAdd
  | MixpanelActionTrackTypes.DocPropUpdateName
  | MixpanelActionTrackTypes.DocPropUpdateType
  | MixpanelActionTrackTypes.DocPropUpdateValue
  | MixpanelActionTrackTypes.DocPropDelete
  | MixpanelActionTrackTypes.TableColAdd
  | MixpanelActionTrackTypes.TableColDelete
  | MixpanelActionTrackTypes.TableColUpdateOrder
  | MixpanelViewEvent
  | MixpanelAutomationEvent

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
  | MixpanelActionTrackTypes.DocDueDateAdd
  | MixpanelActionTrackTypes.DocTagAdd
  | MixpanelActionTrackTypes.DocBookmarkCreate
  | MixpanelActionTrackTypes.DocBookmarkDelete
  | MixpanelActionTrackTypes.DocShareCreate
  | MixpanelActionTrackTypes.DocArchive
  | MixpanelActionTrackTypes.DocUnarchive
  | MixpanelActionTrackTypes.DocEmoji
  | MixpanelActionTrackTypes.DocStatusClear
  | MixpanelActionTrackTypes.DocStatusInProgress
  | MixpanelActionTrackTypes.DocStatusPaused
  | MixpanelActionTrackTypes.DocStatusCompleted
  | MixpanelActionTrackTypes.DocStatusArchived
  | MixpanelActionTrackTypes.DocAssigneesAdd
  | MixpanelActionTrackTypes.DocAssigneesRemove
  | MixpanelActionTrackTypes.DocPropsUpdated

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

export type MixpanelOpenInviteEvent =
  | MixpanelActionTrackTypes.OpenInviteCreate
  | MixpanelActionTrackTypes.OpenInviteDelete
  | MixpanelActionTrackTypes.OpenInviteReset

export type MixpanelCommentThreadEvent =
  | MixpanelActionTrackTypes.DocCommentThreadCreate
  | MixpanelActionTrackTypes.DocCommentThreadEdit
  | MixpanelActionTrackTypes.DocCommentThreadDelete
  | MixpanelActionTrackTypes.LineCommentThreadCreate
  | MixpanelActionTrackTypes.LineCommentThreadEdit
  | MixpanelActionTrackTypes.LineCommentThreadDelete

export type MixpanelCommentEvent =
  | MixpanelActionTrackTypes.CommentCreate
  | MixpanelActionTrackTypes.CommentUpdate
  | MixpanelActionTrackTypes.CommentDelete

export type MixpanelIntegrationEvent =
  MixpanelActionTrackTypes.IntegrationCreateSlack

export type MixpanelUserProfile = {
  $first_name?: string
  $last__name?: string
  $created?: string
  $email?: string
}
export type MixpanelSmartViewEvent =
  | MixpanelActionTrackTypes.SmartViewCreate
  | MixpanelActionTrackTypes.SmartViewUpdateName
  | MixpanelActionTrackTypes.SmartViewUpdateFilter
  | MixpanelActionTrackTypes.SmartViewDestroy

export type MixpanelDashboardEvent =
  | MixpanelActionTrackTypes.DashboardCreate
  | MixpanelActionTrackTypes.DashboardEdit
  | MixpanelActionTrackTypes.DashboardDelete

export type MixpanelAutomationEvent =
  | MixpanelActionTrackTypes.WorkflowCreate
  | MixpanelActionTrackTypes.WorkflowDelete
  | MixpanelActionTrackTypes.WorkflowUpdate
  | MixpanelActionTrackTypes.AutomationCreate
  | MixpanelActionTrackTypes.AutomationDelete
  | MixpanelActionTrackTypes.AutomationUpdate
