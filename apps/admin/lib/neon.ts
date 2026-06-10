import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

export const neonSql = databaseUrl ? neon(databaseUrl) : null;
