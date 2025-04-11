import type { FnMap } from '@byc/tipc/type'
import { defineSchema } from '@byc/tipc/schema'

export const exportNamedSchema = defineSchema('ExportNamed')
export const exportNamedSchemaHaveTypeArg = defineSchema<{ name: () => void }>('ExportNamedHaveTypeArg')
export const exportNamedSchemaHaveFnMap = defineSchema<FnMap>('ExportNamedHaveFnMap')

export default defineSchema('ExportDefault')
