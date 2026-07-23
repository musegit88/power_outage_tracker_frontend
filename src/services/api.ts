import type { CreateOutage, User } from "@/types";
import tokenService from "./tokenService";

const API_URL = import.meta.env.VITE_API_URL;

let isRefreshing = false
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void
}[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    }
    else {
      resolve(token!)
    }
  })
  failedQueue = []
}

// Custom API error that preserves all extra fields the server sends
export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(status: number, data: Record<string, unknown>) {
    super((data.error as string) || "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }

  /** Convenience getter — returns the server's human-readable detail message */
  get detail(): string | undefined {
    return this.data.message as string | undefined;
  }

  /** True when the server returned HTTP 429 */
  get isRateLimit(): boolean {
    return this.status === 429;
  }

  /** True when the server returned HTTP 409 (e.g. duplicate nearby outage) */
  get isConflict(): boolean {
    return this.status === 409;
  }
}
interface options {
  method?: string | undefined;
  body?: BodyInit | null;
  headers?: HeadersInit | undefined;
}

class ApiServices {
  async refreshTokens(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      tokenService.clearAuth();
      window.location.href = "/signin";
      throw new ApiError(401, { error: "Session expired" });
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        return { accessToken: token as string, refreshToken: tokenService.getRefreshToken() || "" };
      });
    }

    isRefreshing = true;
    try {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawToken: refreshToken }),
      });

      if (!refreshResponse.ok) {
        tokenService.clearAuth();
        processQueue(new Error("Refresh failed"), null);
        window.location.href = "/signin";
        throw new ApiError(401, { error: "Session expired" });
      }

      const refreshData = await refreshResponse.json();
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshData;

      tokenService.setAccessToken(newAccessToken);
      tokenService.setRefreshToken(newRefreshToken);

      processQueue(null, newAccessToken);
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      processQueue(error, null);
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  async request(endpoint: string, options: options = {}, _isRetry = false): Promise<any> {
    let accessToken = tokenService.getAccessToken();

    // Proactive refresh: if access token is expired and we have a refresh token, refresh BEFORE fetch!
    if (
      accessToken &&
      tokenService.isTokenExpired(accessToken) &&
      !_isRetry &&
      !endpoint.startsWith("/auth/")
    ) {
      try {
        const tokens = await this.refreshTokens();
        accessToken = tokens.accessToken;
      } catch (err) {
        // If refresh fails, user will be redirected to /signin
      }
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !_isRetry) {
      // Don't try to refresh on auth endpoints (login/register/refresh)
      if (
        endpoint.startsWith("/auth/login") ||
        endpoint.startsWith("/auth/register") ||
        endpoint.startsWith("/auth/refresh")
      ) {
        const data = await response.json();
        throw new ApiError(response.status, data as Record<string, unknown>);
      }

      await this.refreshTokens();
      return this.request(endpoint, options, true);
    }

    // If we retried and still got 401, the session is truly gone
    if (response.status === 401 && _isRetry) {
      tokenService.clearAuth();
      window.location.href = "/signin";
      throw new ApiError(401, { error: "Session expired" });
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data as Record<string, unknown>);
    }

    return data;
  }

  //   Auth endpoints

  async register(
    name: string,
    email: string,
    phoneNumber: string,
    password: string,
    consents: {
      consentType: string;
      accepted: boolean;
    }[],
  ) {
    const data = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, phoneNumber, password, consents }),
    });
    const { accessToken, refreshToken, user } = data.response;

    // Store tokens
    tokenService.setAccessToken(accessToken);
    if (refreshToken) {
      tokenService.setRefreshToken(refreshToken);
    }

    // Store user data
    tokenService.setUser(user);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const { accessToken, refreshToken, user } = data.response;

    // Store tokens
    tokenService.setAccessToken(accessToken);
    if (refreshToken) {
      tokenService.setRefreshToken(refreshToken);
    }

    // Store user data
    tokenService.setUser(user);
    return data;
  }

  async logout() {
    // TODO: Add logout endpoint call

    // Clear tokens
    tokenService.clearAuth();
  }

  async getProfile(): Promise<User> {
    const response = await this.request("/auth/profile");

    // Update stored user data
    tokenService.setUser(response.user);
    // return this.request("/auth/profile");
    return response.user;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return tokenService.isAuthenticated();
  }

  // Get current user from storage
  getCurrentUser() {
    return tokenService.getUser();
  }

  // outages endpoints

  async createOutage(outageData: CreateOutage) {
    return this.request("/outages/create", {
      method: "POST",
      body: JSON.stringify({
        ...outageData,
        longitude: outageData.coordinates.longitude,
        latitude: outageData.coordinates.latitude,
      }),
    });
  }

  async getAllOutages(limit: number, offset: number, status?: string) {
    return status && status !== "ALL"
      ? this.request(
        `/outages?limit=${limit}&offset=${offset}&status=${status}`,
      )
      : this.request(`/outages?limit=${limit}&offset=${offset}`);
  }

  async getInMapBounds(
    neLat: number,
    neLng: number,
    swLat: number,
    swLng: number,
  ) {
    return this.request(
      `/outages/in-bounds?neLat=${neLat}&neLng=${neLng}&swLat=${swLat}&swLng=${swLng}`,
    );
  }

  async addConfirmation(outageId: string, userId: string) {
    return this.request(`/outages/${outageId}/confirm`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async getOutageById(outageId: string) {
    return this.request(`/outages/${outageId}`);
  }

  async updateOutageStatus(outageId: string, status: string) {
    return this.request(`/outages/${outageId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }
}

export default new ApiServices();
