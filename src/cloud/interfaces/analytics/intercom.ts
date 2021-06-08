// intercom replaces periods with hyphens and is case insensitive

export enum IntercomDataEvent {
  DocCreate = 'doc-create',
  InviteCreate = 'invite-create',
  MemberCreate = 'member-create',
  ViewerCreate = 'viewer-create',
  TrialStart = 'trial-create',
  SubscriptionStart = 'sub-create',
  TeamCreate = 'team-create',
  PersonalTeamCreate = 'personal-create',
}
