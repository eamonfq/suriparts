import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'db', 'suriparts.db');

// Wrapper that mimics the better-sqlite3 API using sql.js (pure WASM)
class DatabaseWrapper {
  constructor(sqlDb, filePath) {
    this._db = sqlDb;
    this._filePath = filePath;
    this._inTransaction = false;
  }

  prepare(sql) {
    const self = this;
    return {
      get(...params) {
        const stmt = self._db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        let result = null;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result || undefined;
      },
      all(...params) {
        const stmt = self._db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      run(...params) {
        self._db.run(sql, params);
        const changes = self._db.getRowsModified();
        const res = self._db.exec("SELECT last_insert_rowid() as id");
        const lastInsertRowid = res.length > 0 ? res[0].values[0][0] : 0;
        if (!self._inTransaction) self._save();
        return { changes, lastInsertRowid };
      }
    };
  }

  exec(sql) {
    this._db.exec(sql);
    this._save();
  }

  pragma(str) {
    try {
      this._db.run(`PRAGMA ${str}`);
    } catch (e) {
      // Some pragmas (like WAL) aren't supported in sql.js
    }
  }

  transaction(fn) {
    const self = this;
    return (...args) => {
      self._db.run('BEGIN');
      self._inTransaction = true;
      try {
        const result = fn(...args);
        self._db.run('COMMIT');
        self._inTransaction = false;
        self._save();
        return result;
      } catch (e) {
        self._db.run('ROLLBACK');
        self._inTransaction = false;
        throw e;
      }
    };
  }

  _save() {
    if (this._filePath) {
      const data = this._db.export();
      writeFileSync(this._filePath, Buffer.from(data));
    }
  }
}

// Initialize sql.js and load/create database
const SQL = await initSqlJs();
let sqlDb;

if (existsSync(dbPath)) {
  const buffer = readFileSync(dbPath);
  sqlDb = new SQL.Database(buffer);
} else {
  // Auto-create database with schema if it doesn't exist
  sqlDb = new SQL.Database();
  const schemaPath = join(__dirname, '..', 'db', 'schema.sql');
  if (existsSync(schemaPath)) {
    const schema = readFileSync(schemaPath, 'utf-8');
    sqlDb.exec(schema);
    const data = sqlDb.export();
    writeFileSync(dbPath, Buffer.from(data));
    console.log('Database created from schema.sql');
  }
}

const db = new DatabaseWrapper(sqlDb, dbPath);
db.pragma('foreign_keys = ON');

export default db;
