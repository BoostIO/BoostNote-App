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
  export type ThemedBaseStyledInterface<T> = {
    [key: string]: <P>(
      strings: TemplateStringsArray,
      ...keys: Array<
        | number
        | undefined
        | string
        | ((props: { theme: T } & P) => string | number | undefined)
      >
    ) => any
  }
  export const ThemeProvider: any
  export const keyframes = any
}
