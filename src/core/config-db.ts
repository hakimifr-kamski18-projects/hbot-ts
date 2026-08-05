import { Database } from "bun:sqlite";

export class PluginConfigDB {
  private db: Database;

  constructor(dbPath: string = "") {
    const path = dbPath ?? "plugins.sqlite";
    this.db = new Database(path);
    this.init();
  }

  private init(): void {
    this.db.run("PRAGMA journal_mode = WAL;");
    this.db.run("PRAGMA foreign_keys = ON;");

    this.db.run(`
      CREATE TABLE IF NOT EXISTS plugin_configs (
        plugin_name TEXT PRIMARY KEY,
        config_json TEXT NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `);
  }

  get<T extends Record<string, any>>(pluginName: string): T | null {
    const statement = this.db.query<{ config_json: string }, [string]>(
      "SELECT config_json FROM plugin_configs WHERE plugin_name = ?",
    );
    const row = statement.get(pluginName);
    statement.finalize();

    if (!row) return null;
    return JSON.parse(row.config_json) as T;
  }

  set<T extends Record<string, any>>(pluginName: string, config: T): void {
    const json = JSON.stringify(config);
    this.db.run(
      `
      INSERT INTO plugin_configs (plugin_name, config_json, updated_at)
      VALUES (?, ?, unixepoch())
      ON CONFLICT(plugin_name)
      DO UPDATE SET config_json = excluded.config_json,
                                  updated_at = excluded.updated_at
    `,
      [pluginName, json],
    );
  }

  delete(pluginName: string): void {
    this.db.run("DELETE FROM plugin_configs WHERE plugin_name = ?", [
      pluginName,
    ]);
  }

  close() {
    this.db.close();
  }

  // TODO(kimi, 2026-8-5): patch (maybe), list, query (maybe), transaction
}
