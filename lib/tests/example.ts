import { z } from 'zod'
import { logger } from '@a_jackie_z/logger'
import { createConfig } from '../config.js'

// Define your configuration schema
const appConfigSchema = z.object({
  port: z.number().int().positive(),
  host: z.string().default('localhost'),
  debug: z.boolean().default(false),
  apiKey: z.string().min(1),
  timeout: z.number().optional(),
})

// Define metadata mapping property names to environment variables
const appConfigMetadata = {
  port: 'APP_PORT',
  host: 'APP_HOST',
  debug: 'APP_DEBUG',
  apiKey: 'API_KEY',
  timeout: 'REQUEST_TIMEOUT',
}

// Create config from environment variables
// In real usage, you'd omit the third parameter to use process.env
const config = createConfig(appConfigSchema, appConfigMetadata, {
  APP_PORT: '8080',
  APP_DEBUG: 'true',
  API_KEY: 'secret-key-123',
  REQUEST_TIMEOUT: '5000',
})

logger.info('Configuration loaded:')
logger.info({ port: config.port, type: typeof config.port }, 'Port')
logger.info({ host: config.host }, 'Host')
logger.info({ debug: config.debug, type: typeof config.debug }, 'Debug')
logger.info({ apiKey: config.apiKey }, 'API Key')
logger.info({ timeout: config.timeout, type: typeof config.timeout }, 'Timeout')

// TypeScript knows the exact shape of config:
// config.port is number
// config.host is string
// config.debug is boolean
// config.apiKey is string
// config.timeout is number | undefined
