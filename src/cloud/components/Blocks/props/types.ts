export interface BlockPropertyProps {
  currentUserIsCoreMember: boolean
  value: string
  onUpdate: (val: string) => Promise<void> | void
}
