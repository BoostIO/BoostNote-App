export type AppComponent<P> = React.FC<P & { className?: string }>

export type ControlButtonProps = {
  disabled?: boolean
  active?: boolean
  icon: string
  onClick: (event: React.MouseEvent) => void
  onContextMenu?: (event: React.MouseEvent) => void
  tooltip?: string
}

export type SubmissionWrappers = {
  beforeSubmitting?: () => void
  afterSubmitting?: () => void
}
