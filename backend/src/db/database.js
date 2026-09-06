import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../kisanqueue.db');

export const db = new DatabaseSync(DB_PATH);

// Enable Foreign Key constraints
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables from schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schemaSql);

/**
 * Helper to prepare and execute SELECT queries returning multiple rows
 */
export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

/**
 * Helper to prepare and execute SELECT query returning a single row
 */
export function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

/**
 * Helper to execute INSERT, UPDATE, DELETE queries
 */
export function run(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

export default {
  db,
  queryAll,
  queryOne,
  run
};
