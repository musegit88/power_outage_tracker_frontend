import type { CreateOutage, User } from "@/types";
import tokenService from "./tokenService";

const API_URL = import.meta.env.VITE_API_URL;

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
  async request(endpoint: string, options: options = {}) {
    const token = tokenService.getAccessToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

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
    const { token, refreshToken, user } = data.response;
    console.log(data);

    // Store tokens
    tokenService.setAccessToken(token);
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
    console.log(data);
    const { token, refreshToken, user } = data.response;

    // Store tokens
    tokenService.setAccessToken(token!);
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
    console.log(outageId);
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
