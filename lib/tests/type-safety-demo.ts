import { z } from 'zod'
import { createConfig } from '../config.js'

// Define a schema
const schema = z.object({
  port: z.number().int().positive(),
  host: z.string().default('localhost'),
  debug: z.boolean().default(false),
})

// ✅ Valid: All keys match schema
const validMetadata = {
  port: 'APP_PORT',
  host: 'APP_HOST',
  debug: 'DEBUG',
}

// ✅ Valid: Partial mapping (some keys omitted)
const partialMetadata = {
  port: 'APP_PORT',
  // host and debug will use defaults
}

// ❌ Invalid: This would cause TypeScript error (typo in key)
// Uncomment to see the error:
// const invalidMetadata = {
//   prot: 'APP_PORT', // TypeScript error: 'prot' is not a key of the schema
//   host: 'APP_HOST',
// }

// ❌ Invalid: This would cause TypeScript error (extra key)
// Uncomment to see the error:
// const extraKeyMetadata = {
//   port: 'APP_PORT',
//   host: 'APP_HOST',
//   extra: 'EXTRA_VAR', // TypeScript error: 'extra' is not a key of the schema
// }

// Test valid usage
const config1 = createConfig(schema, validMetadata, {
  APP_PORT: '3000',
  APP_HOST: 'example.com',
  DEBUG: 'true',
})

console.log('Full metadata config:', config1)

// Test partial mapping
const config2 = createConfig(schema, partialMetadata, {
  APP_PORT: '8080',
})

console.log('Partial metadata config:', config2)

