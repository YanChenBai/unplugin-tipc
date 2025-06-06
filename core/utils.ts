import type { CallExpression } from 'oxc-parser'
import type { SchemaMapType } from './types'
import path from 'node:path'
import oxc from 'oxc-parser'

const CALL_NAME = 'defineSchema'

function isFnMap(type: oxc.TSType) {
  return type.type === 'TSTypeReference' && type.typeName.type === 'Identifier' && type.typeName.name === 'FnMap'
}

function getSchemaInfo(node: CallExpression) {
  const { callee, arguments: args } = node
  const arg = args[0]
  if (
    callee.type === 'Identifier'
    && callee.name === CALL_NAME
    && arg
    && arg.type === 'Literal'
    && typeof arg.value === 'string'
  ) {
    let handler = false
    let listener = false

    const typeArguments = node.typeArguments

    if (typeArguments && typeArguments.params.length > 0) {
      const [hType, lType] = typeArguments.params as [oxc.TSType | undefined, oxc.TSType | undefined]
      if (hType && !isFnMap(hType)) {
        handler = true
      }

      if (lType && !isFnMap(lType)) {
        listener = true
      }
    }

    return {
      name: arg.value,
      handler,
      listener,
    }
  }
}

export function searchDefineSchema(code: string, resourcePath: string, map: Map<string, SchemaMapType>) {
  const result = oxc.parseSync(resourcePath, code)

  for (const decl of result.program.body) {
    // export named
    if (
      decl.type === 'ExportNamedDeclaration'
      && decl.declaration?.type === 'VariableDeclaration'
      && decl.declaration.declarations.length > 0
    ) {
      const declarations = decl.declaration.declarations

      for (const { init, id } of declarations) {
        if (id.type !== 'Identifier' || init?.type !== 'CallExpression')
          continue

        const info = getSchemaInfo(init)

        if (!info)
          continue

        map.set(info.name, {
          resourcePath,
          exportName: id.name,
          ...info,
        })
      }

      continue
    }

    // export default
    if (decl.type === 'ExportDefaultDeclaration' && decl.declaration.type === 'CallExpression') {
      const info = getSchemaInfo(decl.declaration)

      if (!info)
        continue

      map.set(info.name, {
        resourcePath,
        exportName: 'default',
        ...info,
      })
    }
  }

  return map
}

export function normalizePath(filename: string) {
  return filename.replaceAll('\\', '/')
}

export function generateImport(filePath: string, exports: string[] = ['default']) {
  if (exports.length <= 0)
    exports.push('default')

  const accessPath = exports.map(item => `['${item}']`)
  return `typeof import('./${normalizePath(filePath)}')${accessPath.join('')}` as const
}

export function generateDts(rootPath: string, map: Map<string, SchemaMapType>) {
  const invokeExpose: string[] = []
  const listenerExpose: string[] = []

  const list = [...map.values()]

  for (const { name, resourcePath, exportName, handler, listener } of list) {
    const from = path.relative(rootPath, resourcePath)
    if (handler) {
      invokeExpose.push(`${name}: ${generateImport(from, [exportName, 'handlers'])}`)
    }

    if (listener) {
      listenerExpose.push(`${name}: ${generateImport(from, [exportName, 'listeners'])}`)
    }
  }

  return `/* eslint-disable */
// @ts-nocheck
// Generated by unplugin-tipc
// biome-ignore lint: disable
export {}

declare module '@byc/tipc' {
  interface TipcInvokeExpose {
    ${invokeExpose.join('\n    ')}
  }

  interface TipcListenerExpose {
    ${listenerExpose.join('\n    ')}
  }
}
`
}
