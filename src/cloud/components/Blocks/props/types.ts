export interface BlockPropertyProps {
  value: string
  onUpdate: (val: string) => Promise<void> | void
}
