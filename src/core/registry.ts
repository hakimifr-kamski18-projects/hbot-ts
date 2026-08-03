import type { Plugin } from "./plugin";

/**
 * The plugins that are currently loaded.
 *
 * This exists so plugins like `/help` can see their siblings without
 * importing the entrypoint (which would be circular). The loader owns
 * writing to it; everything else should treat it as read-only.
 */
let loaded: readonly Plugin[] = [];

function setLoadedPlugins(plugins: Plugin[]): void {
  loaded = Object.freeze([...plugins]);
}

function getLoadedPlugins(): readonly Plugin[] {
  return loaded;
}

export { setLoadedPlugins, getLoadedPlugins };
