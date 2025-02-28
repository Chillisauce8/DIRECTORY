import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { parse as parseMarkdown } from 'markdown-it'

interface ValidationReport {
  brokenLinks: string[]
  missingInterfaces: string[]
  outdatedPaths: string[]
}

interface AIDocMarker {
  type: 'interface' | 'component' | 'route' | 'api'
  location: string
  lastValidated: string
  hash: string // Hash of the referenced code
}

const PROJECT_ROOT = resolve(__dirname, '..')

function validateDocumentation(): ValidationReport {
  const mapping = JSON.parse(
    readFileSync(resolve(PROJECT_ROOT, 'docs/doc-mapping.json'), 'utf8')
  )
  const report: ValidationReport = {
    brokenLinks: [],
    missingInterfaces: [],
    outdatedPaths: []
  }

  // Validate each documented file exists
  Object.keys(mapping.codeToDocMap).forEach(sourceFile => {
    try {
      readFileSync(resolve(PROJECT_ROOT, sourceFile))
    } catch {
      report.outdatedPaths.push(sourceFile)
    }
  })

  // Validate interface definitions
  Object.values(mapping.codeToDocMap).forEach(config => {
    if (config.interfaces) {
      const docContent = readFileSync(resolve(PROJECT_ROOT, config.docFile), 'utf8')
      config.interfaces.forEach(interfaceName => {
        if (!docContent.includes(`interface ${interfaceName}`)) {
          report.missingInterfaces.push(
            `${interfaceName} not found in ${config.docFile}`
          )
        }
      })
    }
  })

  return report
}

function generateAIMarkers(filePath: string): AIDocMarker[] {
  const content = readFileSync(resolve(PROJECT_ROOT, filePath), 'utf8')
  const markers: AIDocMarker[] = []

  // Add markers for interfaces
  const interfaceMatches = content.match(/interface\s+\w+/g) || []
  interfaceMatches.forEach(match => {
    markers.push({
      type: 'interface',
      location: filePath,
      lastValidated: new Date().toISOString(),
      hash: generateHash(match)
    })
  })

  // Add markers for components, routes, etc.
  // Similar pattern for other types

  return markers
}

function updateDocumentationWithAIMarkers(docFile: string, markers: AIDocMarker[]): void {
  let content = readFileSync(resolve(PROJECT_ROOT, docFile), 'utf8')
  
  // Add AI markers in HTML comments that won't show in rendered markdown
  const markerComment = `<!--
    @ai-doc-markers
    ${JSON.stringify(markers, null, 2)}
    @end-ai-doc-markers
  -->`
  
  if (content.includes('@ai-doc-markers')) {
    content = content.replace(/<!--\s*@ai-doc-markers[\s\S]*?@end-ai-doc-markers\s*-->/m, markerComment)
  } else {
    content = markerComment + '\n\n' + content
  }
  
  writeFileSync(resolve(PROJECT_ROOT, docFile), content)
}

function validateAgainstMarkers(docFile: string): boolean {
  const content = readFileSync(resolve(PROJECT_ROOT, docFile), 'utf8')
  const markerMatch = content.match(/<!--\s*@ai-doc-markers([\s\S]*?)@end-ai-doc-markers\s*-->/m)
  
  if (!markerMatch) return true // No markers to validate against
  
  const markers: AIDocMarker[] = JSON.parse(markerMatch[1])
  let isValid = true
  
  markers.forEach(marker => {
    const sourceContent = readFileSync(resolve(PROJECT_ROOT, marker.location), 'utf8')
    const currentHash = generateHash(sourceContent)
    
    if (currentHash !== marker.hash) {
      console.warn(
        `Warning: Documentation in ${docFile} might be outdated.\n` +
        `Source code at ${marker.location} has changed since last validation.`
      )
      isValid = false
    }
  })
  
  return isValid
}

const report = validateDocumentation()
const markersValid = validateAgainstMarkers('docs/auth/AUTH.md')

console.log('Documentation Validation Report:', report)

if (!markersValid || report.brokenLinks.length || report.missingInterfaces.length || report.outdatedPaths.length) {
  process.exit(1)
}
