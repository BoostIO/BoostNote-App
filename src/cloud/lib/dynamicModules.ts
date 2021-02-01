type Importable = Map<string, any>

interface Exports {
  default?: any
}

export const importDynamicModule = (
  dependencies: Importable,
  string: string
) => {
  const require = (moduleName: string) => {
    return dependencies.get(moduleName)
  }
  const exports: Exports = {}

  const moduleConstructor = Function('exports', 'require', string)
  moduleConstructor(exports, require)
  return exports
}
