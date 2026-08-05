import { PluginConfigDB } from "./config-db";

export class PluginConfig<T extends Record<string, any>> {
  constructor(
    private db: PluginConfigDB,
    private name: string,
    private defaults: T,
  ) {}

  get(): T {
    return this.db.get<T>(this.name) ?? { ...this.defaults };
  }

  set(config: T): void {
    this.db.set(this.name, config);
  }

  reset(): void {
    this.db.set(this.name, { ...this.defaults });
  }

  delete(): void {
    this.db.delete(this.name);
  }
}
