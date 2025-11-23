/**
 * @typedef {typeof import("./endpoints.js").ENDPOINTS} ENDPOINTS_TYPE
 */

import { ENDPOINTS } from "./endpoints.js";

/** @typedef {keyof ENDPOINTS_TYPE} EndpointKey */

/**
 * @param {EndpointKey} key
 * @param {{
 *   method?: string,
 *   body?: any,
 *   headers?: Object,
 *   onSuccess?: Function,
 *   onError?: Function,
 *   onFinally?: Function
 *   pathSuffix?: string
 * }} options
 */

const BASE_URL = window.location.hostname === "localhost" ? "http://localhost:4000" : (import.meta.env.VITE_API_URL || "");

export async function apiClient(
  key,
  {
    method = "GET",
    body,
    headers,
    onSuccess,
    onError,
    onFinally,
    pathSuffix
  } = {}
) {

  const endpoint = ENDPOINTS[key];

  if (!endpoint) {
    throw new Error(`Endpoint "${key}" no existe en ENDPOINTS`);
  }

  let url = `${BASE_URL}${endpoint}`;
  if (pathSuffix) {
    const normalizedSuffix = pathSuffix.startsWith('/') ? pathSuffix : `/${pathSuffix}`;
    url += normalizedSuffix;
  }

  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (onError) onError(data);
      return { ok: false, status: response.status, data };
    }

    if (onSuccess) onSuccess(data);
    return { ok: true, status: response.status, data };

  } catch (error) {
    if (onError) onError(error);
    return { ok: false, status: null, error };
  } finally {
    if (onFinally) onFinally();
  }
}