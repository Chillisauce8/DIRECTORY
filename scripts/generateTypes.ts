import { compile } from 'json-schema-to-typescript'
import fs from 'fs'
import path from 'path'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables with priority for .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

async function generateTypes() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set')
    }

    const client = new MongoClient(process.env.MONGODB_URI)

    try {
        await client.connect()
        console.log('Connected to MongoDB')

        const db = client.db()
        
        // Get all collections
        const collections = await db.listCollections().toArray()

        for (const collection of collections) {
            // Get collection schema
            const schema = await db.command({
                collMod: collection.name,
                validator: { $jsonSchema: {} }
            })

            if (schema) {
                const typescript = await compile(schema.validator.$jsonSchema, collection.name, {
                    bannerComment: '// Auto-generated from MongoDB JSON Schema. Do not edit manually.'
                })
                
                fs.writeFileSync(
                    path.join(__dirname, '../types', `${collection.name}.ts`),
                    typescript
                )
                console.log(`✅ Generated types for ${collection.name}`)
            }
        }
        
        console.log('✅ All types generated successfully')
    } catch (error) {
        console.error('❌ Error generating types:', error)
        process.exit(1)
    } finally {
        await client.close()
    }
}

generateTypes()
