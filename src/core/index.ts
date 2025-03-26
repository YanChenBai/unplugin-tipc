import type { VariableDeclarator, Declaration, CallExpression, ExportSpecifier, IdentifierName } from 'oxc-parser'
import oxc from 'oxc-parser'

interface ExportModule {
  default: boolean
  from: string
  import: string
}

const CALL_NAME = 'defineSchema'

function getCallExpr(node: VariableDeclarator) {
    if(node.init?.type === 'CallExpression') {
        return node.init
    }
}

function getCallDefineSchema(node: CallExpression) {
  if (node?.callee.type === 'Identifier' && node.callee.name === CALL_NAME) {
    return node
  }
}

function varDeclsRecFind(varDeclsRec: VariableDeclarator[], target: VariableDeclarator) {
    return varDeclsRec.find(
        item => item.id.type === 'Identifier' && target.init?.type === 'Identifier' && target.init.name === item.id.name
    )
}

function find(varDeclsRec:VariableDeclarator[], varDecls:VariableDeclarator[] | VariableDeclarator) {
    const normalizeVarDecls = Array.isArray(varDecls) ? varDecls : [varDecls]
    for(const varDecl of normalizeVarDecls) {
        const id =varDecl.id

        
        if(id.type === 'Identifier') {
            if(varDecl.init?.type === 'Identifier' && varDeclsRecFind(varDeclsRec, varDecl)) {
                console.log('Export', varDecl.id);
            }

            if(varDecl.init?.type === 'CallExpression' && getCallDefineSchema(varDecl.init)) {
                console.log('Export', varDecl.id);
            }
        }

        if(varDecl.id.type === 'ArrayPattern' && varDecl.init?.type === 'ArrayExpression') {
            // console.log("ArrayPattern ExportItem:", [
            //     varDecl.id.elements,
            //     varDecl.init.elements,
            // ]);

            varDecl.init.elements.forEach((item,index)=>{
                console.log(varDeclsRec);
                
                if(item?.type === 'Identifier') {
                    console.log('Export XX', item);
                }
                
            })
        }
    }
}

export function searchDefineSchema(code: string, resourcePath: string) {
  const result = oxc.parseSync(resourcePath, code)

  const defineSchemaVar: VariableDeclarator[] = []

  for (const decl of result.program.body) {
    // 收集调用了defineSchema但没导出的节点
    if (decl.type === 'VariableDeclaration'){
        defineSchemaVar.push(
            ...decl.declarations.filter(item=>{
                const callExpr = getCallExpr(item)
                if(callExpr)
                     return getCallDefineSchema(callExpr)
             })
        )
        
    }
    //   defineSchemaCall.push(...decl.declarations.filter(item => isCallDefineSchema(item)))

    // export
    if (decl.type === 'ExportNamedDeclaration') {
        // console.log(decl);
        // console.log("Specifiers:",decl.specifiers);

        if(decl.declaration?.type === 'VariableDeclaration') {
            
            find(defineSchemaVar, decl.declaration.declarations)
            
        }

        if(decl.specifiers.length > 0) {
            // console.log("Specifiers:",decl.specifiers);
            
        }
              
        
        // console.log("VariableDeclaration:", decl.declaration.declarations);
        
    }

    // default export
    if (decl.type === 'ExportDefaultDeclaration') {

      // 默认导出为函数调用
      if (decl.declaration.type === 'CallExpression') {
        //   console.log("Default Export CallExpression:", getCallDefineSchema(decl.declaration));
      }

      // 默认导出为变量
      if(decl.declaration.type === 'Identifier') {
        const name = decl.declaration.name
        
        const isDefineSchema = defineSchemaVar.find(item=>item.id.type === 'Identifier' && item.id.name === name)

        if(isDefineSchema){
            console.log("Default Export Identifier:", decl.declaration);
        }
      }
    }

    
    // console.log("defineSchemaVar", defineSchemaVar);
}


//   console.log(defineSchemaCall)

  //   result.program.body.forEach((exportDecl) => {
  //     // 收集调用了defineSchema但没导出的节点
  //     if (exportDecl.type === 'VariableDeclaration')
  //       defineSchemaCall.push(...exportDecl.declarations.filter(item => isCallDefineSchema(item)))

  //     if (exportDecl.type === 'ExportNamedDeclaration'
  //       && exportDecl.declaration?.type === 'VariableDeclaration') {
  //       exportDecl.declaration.declarations.forEach((declaration) => {
  //         // console.log(isCallDefineSchema(declaration))

  //         // Check if declaration is a defineTipc call
  //         // if (declaration.id.type === 'Identifier'
  //         //   && declaration.init?.type === 'CallExpression'
  //         //   && declaration.init.callee.type === 'Identifier'
  //         //   && declaration.init.callee.name === 'defineSchema') {
  //         //   const firstArg = declaration.init.arguments[0]
  //         //   if (firstArg.type !== 'Literal')
  //         //     return

  //         //   if (typeof firstArg.value !== 'string')
  //         //     return

  //         //   modules.set(firstArg.value, {
  //         //     default: false,
  //         //     from: resourcePath,
  //         //     import: declaration.id.name,
  //         //   })
  //         // }
  //       })
  //     }

  //     console.log(defineSchemaCall)
  //   })

//   console.log(modules)

  return code
}
