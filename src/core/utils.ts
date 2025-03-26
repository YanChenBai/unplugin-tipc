export function normalizePath(filename: string) {
  return filename.replaceAll('\\', '/')
}

export function generateModuleTypeAccess(filePath: string, exports: string | string[] = ['default']) {
  const normalizedExports = Array.isArray(exports) ? exports : [exports]
  const accessPath = normalizedExports.map(item => `['${item}']`)

  return `typeof import('${normalizePath(filePath)}')${accessPath}` as const
}
