export type AppComponent<P> = React.FC<P & { className?: string }>

export type ControlButtonProps = {
  disabled?: boolean
  icon: string
  onClick: (event: React.MouseEvent) => void
  onContextMenu?: (event: React.MouseEvent) => void
}
