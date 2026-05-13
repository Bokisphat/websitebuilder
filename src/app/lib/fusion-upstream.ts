import type { FusionServerConfig } from "./fusion-env";
import { getFusionServerConfig } from "./fusion-env";

export function fusionAuthHeaders(config: FusionServerConfig): HeadersInit {
  return {
    Accept: "application/json",
    "API-KEY": config.apiKey,
    "API-URL": config.apiUrl,
  };
}

/**
 * GET JSON from Fusion (`host` + pathAndQuery), e.g. pathAndQuery = `/api/fusion/projects?limit=2`.
 */
export async function fusionGet(
  config: FusionServerConfig,
  pathAndQuery: string,
): Promise<Response> {
  const path = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  const url = `${config.hostUrl}${path}`;
  return fetch(url, {
    method: "GET",
    headers: fusionAuthHeaders(config),
    cache: "no-store",
  });
}

export async function fusionGetWithConfig(pathAndQuery: string): Promise<Response | null> {
  const c = getFusionServerConfig();
  if (!c) return null;
  return fusionGet(c, pathAndQuery);
}
