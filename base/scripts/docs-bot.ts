import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve } from 'path'
import { exec } from 'child_process'

interface DocBot {
  scanForChanges(): Promise<void>
  updateDocumentation(): Promise<void>
  extractInterfaces(): Promise<void>
  createPullRequest(): Promise<void>
}

class DocumentationBot implements DocBot {
  private readonly PROJECT_ROOT = resolve(__dirname, '..')
  
  async scanForChanges(): Promise<void> {
    // Get git changes
    const changes = await this.getGitChanges()
    
    // Extract interfaces from changed files
    const interfaces = await this.extractInterfacesFromFiles(changes)
    
    // Update relevant documentation
    await this.updateDocumentationWithInterfaces(interfaces)
  }
  
  private async getGitChanges(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      exec('git diff --name-only HEAD', { cwd: this.PROJECT_ROOT }, (err, stdout) => {
        if (err) reject(err)
        resolve(stdout.split('\n').filter(Boolean))
      })
    })
  }

  private async extractInterfacesFromFiles(files: string[]): Promise<Map<string, string[]>> {
    const interfaces = new Map<string, string[]>()
    
    for (const file of files) {
      if (file.endsWith('.ts')) {
        const content = readFileSync(resolve(this.PROJECT_ROOT, file), 'utf8')
        const matches = content.match(/interface\s+(\w+)\s*\{[^}]*\}/g) || []
        interfaces.set(file, matches)
      }
    }
    
    return interfaces
  }
  
  private async updateDocumentationWithInterfaces(interfaces: Map<string, string[]>): Promise<void> {
    const docMapping = JSON.parse(
      readFileSync(resolve(this.PROJECT_ROOT, 'docs/doc-mapping.json'), 'utf8')
    )
    
    for (const [file, extractedInterfaces] of interfaces) {
      const docFile = docMapping.codeToDocMap[file]?.docFile
      if (docFile) {
        await this.updateDocFile(docFile, extractedInterfaces)
      }
    }
  }
}

// Run the bot
const bot = new DocumentationBot()
bot.scanForChanges().catch(console.error)
