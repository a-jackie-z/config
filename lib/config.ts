/// <reference types="node" />
import { z } from 'zod'

const unwrapSchema = (schema: z.ZodTypeAny): z.ZodTypeAny => {
  if (!schema || !(schema as any)._def) return schema

  const def = (schema as any)._def
  const typeName = def.typeName || def.type

  if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'optional' || typeName === 'nullable') {
    const innerType = def.innerType
    return innerType ? unwrapSchema(innerType) : schema
  }

  if (
    typeName === 'ZodDefault' || typeName === 'default' ||
    typeName === 'ZodCatch' || typeName === 'catch' ||
    typeName === 'ZodReadonly' || typeName === 'readonly'
  ) {
    const innerType = def.innerType
    return innerType ? unwrapSchema(innerType) : schema
  }

  if (typeName === 'ZodEffects' || typeName === 'effects') {
    const innerSchema = def.schema
    return innerSchema ? unwrapSchema(innerSchema) : schema
  }

  if (typeName === 'ZodPipeline' || typeName === 'pipeline') {
    const out = def.out
    return out ? unwrapSchema(out) : schema
  }

  return schema
}

const getPrimitiveKind = (schema: z.ZodTypeAny): 'number' | 'boolean' | 'string' | 'other' => {
  const unwrapped = unwrapSchema(schema)
  if (!unwrapped || !(unwrapped as any)._def) return 'other'

  const def = (unwrapped as any)._def
  const typeName = def.typeName || def.type

  if (typeName === 'ZodNumber' || typeName === 'number') return 'number'
  if (typeName === 'ZodBoolean' || typeName === 'boolean') return 'boolean'
  if (typeName === 'ZodString' || typeName === 'string') return 'string'

  return 'other'
}

const coerceValue = (schema: any, value: string | undefined): unknown => {
  if (value === undefined) return undefined

  const kind = getPrimitiveKind(schema)

  if (kind === 'number') {
    const parsed = z.coerce.number().safeParse(value)
    return parsed.success ? parsed.data : value
  }

  if (kind === 'boolean') {
    // Handle common boolean string representations
    const lower = value.toLowerCase().trim()
    if (lower === 'true' || lower === '1' || lower === 'yes') return true
    if (lower === 'false' || lower === '0' || lower === 'no' || lower === '') return false
    // For other values, let Zod validation handle it
    return value
  }

  return value
}

export function createConfig<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  metadata: Partial<Record<keyof T, string>>,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): z.infer<z.ZodObject<T>> {
  const initial: Record<string, unknown> = {}
  const shape = schema.shape

  for (const key of Object.keys(shape)) {
    const envVarName = metadata[key]
    if (!envVarName) continue

    const rawValue = env[envVarName]
    const fieldSchema = shape[key]
    if (!fieldSchema) continue

    const coerced = coerceValue(fieldSchema, rawValue)

    if (coerced !== undefined) {
      initial[key] = coerced
    }
  }

  return schema.parse(initial)
}
