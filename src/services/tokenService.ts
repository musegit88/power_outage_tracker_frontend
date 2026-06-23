interface DecodedToken {
  userId: string;
  email?: string;
  iat: number; //Issued at
  exp: number; //Expiry
}

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

class TokenService {
  // Store access token
  setAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  //   Get access token
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  //   Store refresh token
  setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  //   Get refresh token
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // Store user data
  setUser(user: string) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Get user data
  getUser() {
    const userFromStorage = localStorage.getItem(USER_KEY);
    if (!userFromStorage) {
      return null;
    }
    try {
      return JSON.parse(userFromStorage);
    } catch (error) {
      console.error("Error parsing user data", error);
      return null;
    }
  }

  // Clear all tokens and user data (logout)
  clearAuth() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) return false;

    // Optionally check if token is expired
    return !this.isTokenExpired(token);
  }

  // Decode JWT token to get payload
  decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token", error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token: string) {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }

  // Get time until token expires (in seconds)
  getTokenExpiryTime(token: string): number {
    const decoded = this.decodeToken(token);
    if (!decoded) return 0;
    const currentTime = Date.now() / 1000;
    return Math.max(0, decoded.exp - currentTime);
  }
}

export default new TokenService();
