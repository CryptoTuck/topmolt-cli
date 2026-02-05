import Conf from "conf";
import { TopmoltClient } from "../sdk/index.js";

interface ConfigSchema {
  baseUrl?: string;
  apiKey?: string;
}

const config = new Conf<ConfigSchema>({
  projectName: "topmolt",
  defaults: {
    baseUrl: undefined,
    apiKey: undefined,
  },
});

export function getConfig(): ConfigSchema {
  return {
    baseUrl: config.get("baseUrl"),
    apiKey: config.get("apiKey"),
  };
}

export function setBaseUrl(url: string): void {
  config.set("baseUrl", url);
}

export function setApiKey(key: string): void {
  config.set("apiKey", key);
}

export function resetConfig(): void {
  config.clear();
}

export function getClient(): TopmoltClient {
  const cfg = getConfig();
  return new TopmoltClient({
    baseUrl: cfg.baseUrl,
    apiKey: cfg.apiKey,
  });
}
