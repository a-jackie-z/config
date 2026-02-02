# @a_jackie_z/config

A type-safe configuration factory for TypeScript microservices. Load and validate environment variables using Zod schemas with automatic type coercion.

## Features

- **Type Safety**: Full TypeScript support with inferred types from Zod schemas
- **Automatic Coercion**: Converts environment variable strings to numbers and booleans
- **Validation**: Built-in validation using Zod with helpful error messages
- **Default Values**: Support for optional fields and default values
- **Zero Configuration**: Simple API with minimal setup

## Installation

```bash
npm install @a_jackie_z/config zod
```

## Quick Start

```typescript
import { z } from 'zod'
import { createConfig } from '@a_jackie_z/config'

// 1. Define your configuration schema
const appConfigSchema = z.object({
  port: z.number().int().positive(),
  host: z.string().default('localhost'),
  debug: z.boolean().default(false),
  apiKey: z.string().min(1),
  timeout: z.number().optional(),
})

// 2. Map schema properties to environment variable names
const appConfigMetadata = {
  port: 'APP_PORT',
  host: 'APP_HOST',
  debug: 'APP_DEBUG',
  apiKey: 'API_KEY',
  timeout: 'REQUEST_TIMEOUT',
}

// 3. Load configuration from environment variables
const config = createConfig(appConfigSchema, appConfigMetadata)

// TypeScript knows the exact types:
// config.port is number
// config.host is string
// config.debug is boolean
// config.apiKey is string
// config.timeout is number | undefined
```

Set environment variables:
```bash
export APP_PORT=8080
export APP_DEBUG=true
export API_KEY=secret-key-123
export REQUEST_TIMEOUT=5000
```

## How It Works

### `createConfig(schema, metadata, env?)`

**Parameters:**
- `schema`: Zod object schema defining your configuration structure
- `metadata`: Object mapping schema properties to environment variable names
- `env`: Optional environment object (defaults to `process.env`)

**Returns:** Validated configuration object with proper TypeScript types

### Automatic Type Coercion

Environment variables are strings by default. The factory automatically converts them:

**Numbers:**
- `"3000"` → `3000`
- `"3.14"` → `3.14`

**Booleans:**
- `"true"`, `"1"`, `"yes"` → `true`
- `"false"`, `"0"`, `"no"`, `""` → `false`

**Strings:**
- No conversion needed

## Examples

### Database Configuration

```typescript
import { z } from 'zod'
import { createConfig } from '@a_jackie_z/config'

const dbConfigSchema = z.object({
  host: z.string(),
  port: z.number().int().positive().default(5432),
  database: z.string(),
  username: z.string(),
  password: z.string(),
  ssl: z.boolean().default(false),
  maxConnections: z.number().int().positive().default(10),
})

const dbConfigMetadata = {
  host: 'DB_HOST',
  port: 'DB_PORT',
  database: 'DB_NAME',
  username: 'DB_USER',
  password: 'DB_PASSWORD',
  ssl: 'DB_SSL',
  maxConnections: 'DB_MAX_CONNECTIONS',
}

const dbConfig = createConfig(dbConfigSchema, dbConfigMetadata)
```

### API Service Configuration

```typescript
import { z } from 'zod'
import { createConfig } from '@a_jackie_z/config'

const apiConfigSchema = z.object({
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  timeout: z.number().int().positive().default(30000),
  retries: z.number().int().min(0).default(3),
  rateLimit: z.number().int().positive().optional(),
})

const apiConfigMetadata = {
  baseUrl: 'API_BASE_URL',
  apiKey: 'API_KEY',
  timeout: 'API_TIMEOUT',
  retries: 'API_RETRIES',
  rateLimit: 'API_RATE_LIMIT',
}

const apiConfig = createConfig(apiConfigSchema, apiConfigMetadata)
```

### Handling Validation Errors

```typescript
import { z } from 'zod'
import { createConfig } from '@a_jackie_z/config'

const configSchema = z.object({
  port: z.number().int().positive(),
  apiKey: z.string().min(1),
})

const configMetadata = {
  port: 'APP_PORT',
  apiKey: 'API_KEY',
}

try {
  const config = createConfig(configSchema, configMetadata)
  console.log('Configuration loaded successfully')
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Configuration validation failed:')
    error.issues.forEach(issue => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
    process.exit(1)
  }
  throw error
}
```

### Testing with Mock Environment

```typescript
import { z } from 'zod'
import { createConfig } from '@a_jackie_z/config'

const configSchema = z.object({
  port: z.number().int().positive(),
  debug: z.boolean().default(false),
})

const configMetadata = {
  port: 'APP_PORT',
  debug: 'APP_DEBUG',
}

// Pass custom environment for testing
const testConfig = createConfig(
  configSchema,
  configMetadata,
  {
    APP_PORT: '3000',
    APP_DEBUG: 'true',
  }
)

console.assert(testConfig.port === 3000)
console.assert(testConfig.debug === true)
```

## API Reference

### `createConfig<T>(schema, metadata, env?)`

Creates a validated configuration object from environment variables.

**Type Parameters:**
- `T extends z.ZodRawShape`: The shape of your Zod schema

**Parameters:**
- `schema: z.ZodObject<T>`: Zod object schema
- `metadata: Partial<Record<keyof T, string>>`: Property to environment variable mapping (partial mapping allowed - unmapped properties must have defaults or be optional)
- `env?: Record<string, string | undefined>`: Optional environment object (defaults to `process.env`)

**Returns:** `z.infer<z.ZodObject<T>>`: Type-safe configuration object

**Throws:** `z.ZodError` when validation fails

### Type Safety

The metadata parameter is type-safe and ensures that:
- Only properties defined in the schema can be mapped
- Properties without environment variable mappings must have default values or be optional in the schema
- TypeScript will catch typos in property names at compile time

## License

MIT

## Author

Sang Lu <connect.with.sang@gmail.com>
