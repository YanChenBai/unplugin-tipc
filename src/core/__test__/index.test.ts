import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'vitest'
import { searchDefineSchema } from '..'

describe('core', () => {
  it('search defineSchema', () => {
    const code = readFileSync(path.resolve(__dirname, 'tipc.demo.ts'), 'utf8')

    searchDefineSchema(code, './tipc.demo.ts')
  })
})
