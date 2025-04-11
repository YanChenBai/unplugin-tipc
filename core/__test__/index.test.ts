import { describe, expect, it } from 'vitest'
import { generateImport, searchDefineSchema } from '../utils'

const testCode = `
export const example_1 = defineSchema('Example1')
export const example_2 = defineSchema<{ name: () => void }>('Example2')
export const example_3 = defineSchema<{ name: () => void }, FnMap>('Example3')
export const example_4 = defineSchema<FnMap, { name: () => void }>('Example4')
export const example_5 = defineSchema<FnMap>('Example5')
export const example_6 = defineSchema<FnMap, FnMap>('Example6')
export default defineSchema('Example7')
`

const schemaTestCases = [
  { name: 'Example1', exportName: 'example_1', handler: false, listener: false },
  { name: 'Example2', exportName: 'example_2', handler: true, listener: false },
  { name: 'Example3', exportName: 'example_3', handler: true, listener: false },
  { name: 'Example4', exportName: 'example_4', handler: false, listener: true },
  { name: 'Example5', exportName: 'example_5', handler: false, listener: false },
  { name: 'Example6', exportName: 'example_6', handler: false, listener: false },
  { name: 'Example7', exportName: 'default', handler: false, listener: false },
]

describe('查找 schema', () => {
  it('查找 schema', () => {
    const result = searchDefineSchema(testCode, 'test.ts')

    expect(result.size).toBe(7)
  })

  it.each(schemaTestCases)(
    '测试 %o',
    ({ name, exportName, handler, listener }) => {
      const result = searchDefineSchema(testCode, 'test.ts')
      const schemaMap = result.get(name)

      expect(schemaMap?.exportName).toBe(exportName)
      expect(schemaMap?.handler).toBe(handler)
      expect(schemaMap?.listener).toBe(listener)
    },
  )
})

describe('生成 import', () => {
  it('生成默认 import', () => {
    const result = generateImport('filePath')
    expect(result).toBe(`typeof import('filePath')['default']`)
  })

  it('生成嵌套的 import', () => {
    const result = generateImport('filePath', ['main', 'name'])
    expect(result).toBe(`typeof import('filePath')['main']['name']`)
  })

  it('边界测试: 传入空数组返回默认导出', async () => {
    const result = generateImport('filePath', [] as any)
    expect(result).toBe(`typeof import('filePath')['default']`)
  })
})
