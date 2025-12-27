import { cookies } from "next/headers";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface FetchConfig extends RequestInit {
  headers?: HeadersInit;
}

async function request<Res = unknown, Req = unknown>(
  method: HttpMethod,
  baseUrl: string,
  endpoint: string,
  data?: Req,
  config?: FetchConfig
): Promise<Res> {
  const url = `${baseUrl}${endpoint}`;
  console.log("URLLL:", url);

  // ✅ Auto-forward cookie if running on server
  let cookieHeader: HeadersInit = {};
  try {
    const token = (await cookies()).get("token")?.value;
    if (token) cookieHeader = { Cookie: `token=${token}` };
  } catch (err) {
    throw new Error("error reading cookies : ");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(config?.headers ?? {}),
    ...cookieHeader, // add token cookie if available
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: "include", // works in browser
    ...config,
  };

  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  console.log(`[API Request] ${method} ${url}`);
  console.log("Headers:", headers);
  if (options.body) console.log("Body:", options.body);

  try {
    const res = await fetch(url, options);

    console.log(
      `[API Response] ${res.status} ${res.statusText} for ${method} ${url}`
    );

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[API Error] ${res.status} ${res.statusText}`, errorBody);
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const json = await res.json();
      console.log("[API Response JSON]", json);
      return json;
    }

    return res as unknown as Res;
  } catch (err) {
    console.error("[API Request Failed]", err);
    throw err;
  }
}

// 🌐 Fetch clients

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";
const INTERNAL_BASE_URL = "http://localhost:3000/api";

function createClient(baseUrl: string) {
  console.log("Creating API client with base URL:", baseUrl);
  return {
    get: <Res = unknown>(endpoint: string, config?: FetchConfig) =>
      request<Res>("GET", baseUrl, endpoint, undefined, config),

    post: <Res = unknown, Req = unknown>(
      endpoint: string,
      data?: Req,
      config?: FetchConfig
    ) => request<Res, Req>("POST", baseUrl, endpoint, data, config),

    put: <Res = unknown, Req = unknown>(
      endpoint: string,
      data?: Req,
      config?: FetchConfig
    ) => request<Res, Req>("PUT", baseUrl, endpoint, data, config),

    delete: <Res = unknown>(endpoint: string, config?: FetchConfig) =>
      request<Res>("DELETE", baseUrl, endpoint, undefined, config),
  };
}

export const ExternalServerApiFetch = createClient(BASE_URL);
export const InternalApiFetch = createClient(INTERNAL_BASE_URL);
