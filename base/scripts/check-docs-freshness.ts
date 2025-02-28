import { statSync, readFileSync } from 'fs'
import { resolve } from 'path'

interface DocMapping {
  codeToDocMap: {
    [key: string]: {
      docFile: string
      description: string
      interfaces?: string[]
      relatedFiles?: string[]
    }
  }
  featureToDocMap: {
    [key: string]: {
      primaryDoc: string
      relatedDocs?: string[]
      keyFiles: string[]
    }
  }
}

const PROJECT_ROOT = resolve(__dirname, '..')

function loadDocMapping(): DocMapping {
  const mappingPath = resolve(PROJECT_ROOT, 'docs/doc-mapping.json')
  return JSON.parse(readFileSync(mappingPath, 'utf8'))
}

function checkDocFreshness(): boolean {
  let isAllFresh = true
  const mapping = loadDocMapping()

  // Check direct file mappings
  Object.entries(mapping.codeToDocMap).forEach(([sourceFile, config]) => {
    const sourceStats = statSync(resolve(PROJECT_ROOT, sourceFile))
    const docStats = statSync(resolve(PROJECT_ROOT, config.docFile))

    if (sourceStats.mtime > docStats.mtime) {
      console.warn(
        `Warning: Documentation ${config.docFile} might be outdated.\n` +
        `Source file ${sourceFile} was modified more recently.\n` +
        `Description: ${config.description}`
      )
      isAllFresh = false
    }
  })

  // Check feature-based mappings
  Object.entries(mapping.featureToDocMap).forEach(([feature, config]) => {
    const docStats = statSync(resolve(PROJECT_ROOT, config.primaryDoc))
    
    config.keyFiles.forEach(sourceFile => {
      const sourceStats = statSync(resolve(PROJECT_ROOT, sourceFile))
      if (sourceStats.mtime > docStats.mtime) {
        console.warn(
          `Warning: Feature documentation for ${feature} might be outdated.\n` +
          `Source file ${sourceFile} was modified more recently than ${config.primaryDoc}`
        )
        isAllFresh = false
      }
    })
  })

  return isAllFresh
}

if (!checkDocFreshness()) {
  process.exit(1)
}
