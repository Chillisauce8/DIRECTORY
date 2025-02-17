import './loadEnv'
import { connect } from 'mongodb'
import { compile } from 'json-schema-to-typescript'
import path from 'path'

async function testGenerateTypes() {
    try {
        const client = await connect(process.env.MONGODB_URI!)g to connect with URI:', process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
        const db = client.db()
        I!)
        console.log('🔍 Fetching schemas from database...')
        const schemas = await db.collection('schemas').find().toArray()
        
        console.log(`📋 Found ${schemas.length} schemas\n`)const schemas = await db.collection('schemas').find().toArray()
        
        for (const schema of schemas) {
            console.log(`\n=== ${schema.collectionName} ===`)
            console.log('Would create file:', path.join('types', `${schema.collectionName}.ts`))(const schema of schemas) {
            
            const typescript = await compile(schema.jsonSchema, schema.collectionName, {
                bannerComment: '// Auto-generated from MongoDB JSON Schema. Do not edit manually.'
            })const typescript = await compile(schema.jsonSchema, schema.collectionName, {
            SON Schema. Do not edit manually.'
            // Preview the first few lines of the generated type
            console.log('\nPreview of generated type:')
            console.log('------------------------')
            console.log(typescript.split('\n').slice(0, 10).join('\n') + '\n...')   console.log('\nPreview of generated type:')
        }    console.log('------------------------')
        script.split('\n').slice(0, 10).join('\n') + '\n...')
        await client.close()
        console.log('\n✅ Dry run completed successfully')
        close()
    } catch (error) {
        console.error('❌ Error during type generation test:', error)
        process.exit(1) catch (error) {
    }       console.error('❌ Error during type generation test:', error)
}        process.exit(1)

testGenerateTypes()}


testGenerateTypes()
