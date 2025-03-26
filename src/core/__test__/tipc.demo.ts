import { defineSchema } from '@byc/tipc/schema'


const TestSchema2 = defineSchema('TestModuleExport_2')
export const TestSchema1 = defineSchema('TestModuleExport_1'), VAR_VAL = 1, E = TestSchema2

export const [TestSchema3,A] = [defineSchema('TestModuleExport_3'),TestSchema1]

const TestSchema4 = defineSchema('TestModuleExport_4')


export {
    TestSchema2 as TestSchemaNew,
    TestSchema4,
}


// export const TestSchema5 = TestSchema4

// export default defineSchema('TestModuleExport_3')
// export default TestSchema2
