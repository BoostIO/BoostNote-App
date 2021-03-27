declare module 'styled-components' {
  export type StyledComponent<T1, T2, T3, T4> = any
  export function createGlobalStyle<T>(
    strings: TemplateStringsArray,
    ...keys: Array<
      | number
      | undefined
      | string
      | ((props: { theme: T }) => string | number | undefined)
    >
  ): any
  export type ThemeKeys<T> = Array<
    | number
    | undefined
    | string
    | ((props: { theme: T }) => string | number | undefined)
  >
  export interface ThemedBaseStyledInterface<T>
    extends ThemeBasedStyledComponentWrapper<T> {
    [key: string]: <P>(
      strings: TemplateStringsArray,
      ...keys: ThemeKeys<T>
    ) => any
  }
  export type ThemeBasedStyledComponentWrapper<T> = {
    <P extends { className?: string }>(component: React.ComponentType<P>): (
      strings: TemplateStringsArray,
      ...keys: ThemeKeys<T>
    ) => React.ReactComponentType<P>
  }
  export const ThemeProvider: any
  export const keyframes = any
  export const ServerStyleSheet: any
}
