import { z } from 'zod';

const envSchema = z.object({
  // Database configuration
  DATABASE_HOST: z.string().min(1, 'DATABASE_HOST is required'),
  DATABASE_PORT: z.string().regex(/^\d+$/, 'DATABASE_PORT must be a number').transform(Number),
  DATABASE_USER: z.string().min(1, 'DATABASE_USER is required'),
  DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD is required'),
  DATABASE_NAME: z.string().min(1, 'DATABASE_NAME is required'),
  
  // JWT configuration
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  
  // Server configuration
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').optional().transform((val) => val ? Number(val) : 3000),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function validateEnv() {
  // Return cached result if already validated
  if (cachedEnv !== null) {
    return cachedEnv;
  }

  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1); // Fail fast
  }
  
  // Cache the validated result
  cachedEnv = result.data;
  return cachedEnv;
}

export type EnvConfig = z.infer<typeof envSchema>;

