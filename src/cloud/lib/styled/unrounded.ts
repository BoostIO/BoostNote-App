export type UnroundedParamTypes =
  | boolean
  | [boolean, boolean]
  | [boolean, boolean, boolean, boolean]

export function createUnroundedStyle(prefix?: string) {
  return {
    getUnroundedClassNames(unrounded: UnroundedParamTypes = false) {
      return typeof unrounded === 'boolean'
        ? unrounded
          ? [
              `${prefix}--unrounded-top-left`,
              `${prefix}--unrounded-bottom-left`,
              `${prefix}--unrounded-top-right`,
              `${prefix}--unrounded-bottom-right`,
            ]
          : []
        : unrounded.length === 2
        ? unrounded.reduce<string[]>((classNames, value, index) => {
            if (value) {
              switch (index) {
                case 1:
                  classNames.push(`${prefix}--unrounded-top-right`)
                  classNames.push(`${prefix}--unrounded-bottom-right`)
                  break
                case 0:
                  classNames.push(`${prefix}--unrounded-bottom-left`)
                  classNames.push(`${prefix}--unrounded-top-left`)
                  break
              }
            }
            return classNames
          }, [])
        : unrounded.reduce<string[]>((classNames, value, index) => {
            if (value) {
              switch (index) {
                case 1:
                  classNames.push(`${prefix}--unrounded-bottom-left`)
                  break
                case 2:
                  classNames.push(`${prefix}--unrounded-top-right`)
                  break
                case 3:
                  classNames.push(`${prefix}--unrounded-bottom-right`)
                  break
                case 0:
                  classNames.push(`${prefix}--unrounded-top-left`)
                  break
              }
            }
            return classNames
          }, [])
    },
    unroundedStyle: `&.${prefix}--unrounded-top-left {
      border-top-left-radius: 0;
    }
    &.${prefix}--unrounded-bottom-left {
      border-bottom-left-radius: 0;
    }
    &.${prefix}--unrounded-top-right {
      border-top-right-radius: 0;
    }
    &.${prefix}--unrounded-bottom-right {
      border-bottom-right-radius: 0;
    }`,
  }
}
