import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
export * as schema from "@/../drizzle/schema"
import * as schema from "@/../drizzle/schema"

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
