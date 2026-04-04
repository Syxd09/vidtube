import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/horizon_planner";

const pool = new pg.Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
