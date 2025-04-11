import type { RsbuildPlugin } from '@rsbuild/core'
import type { SchemaMapType } from './types'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { generateDts, searchDefineSchema } from './utils'

interface Options {
  dtsFileName?: string
  dtsDir?: string
}

export default function (options: Options = {}): RsbuildPlugin {
  return {
    name: 'unplugin-tipc',
    setup: async (api) => {
      const rootPath = api.context.rootPath
      const { dtsFileName, dtsDir } = options

      let map = new Map<string, SchemaMapType>()

      api.transform({ test: /\.ts$/ }, ({ code, resourcePath }) => {
        map = searchDefineSchema(code, resourcePath)
        return code
      })

      api.onBeforeBuild(() => map.clear())

      api.onAfterBuild(() => {
        writeFileSync(dtsDir ?? path.resolve(rootPath, dtsFileName ?? 'tipc.d.ts'), generateDts(rootPath, map))
      })
    },
  }
}
