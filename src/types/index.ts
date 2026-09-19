export interface CreateOutage {
  userId: string;
  locationName: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  affectedHomesEstimated?: number;
  status?: "ACTIVE" | "RESOLVED" | "INVESTIGATING";
  severity?: "MINOR" | "MODERATE" | "SEVERE";
  whatHappened?:
    | "NO_POWER"
    | "PARTIAL_POWER"
    | "LOW_VOLTAGE"
    | "FLICKERING"
    | "HAZARDOUS_SITUATION"
    | "OTHER";
}

export interface Outage {
  id: string;
  longitude: number;
  latitude: number;
  locationName: string;
  description: string;
  status: string;
  severity: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  _count: {
    confirmations: number;
  };
  affectedHomesEstimated?: number;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
}

export interface AuthResponseType {
  response: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface ProfileResponse {
  user: User;
  message: string;
}

export interface GetallOutagesResponseType {
  count: number;
  outages: Outage[];
}

export interface AddConfirmationResponseType {
  error?: string;
  message?: string;
  confirmation: {
    outage: {
      _count: {
        confirmations: number;
      };
    } & {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      locationName: string;
      description: string;
      whatHappened: string;
      latitude: number;
      longitude: number;
      affectedHomesEstimated: number | null;
      status: string;
      severity: string;
      resolvedAt: Date | null;
      archived: boolean;
    };
  } & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    outageId: string;
    userId: string;
  };
}

export interface UpdateOutageStatusresponseType {
  error?: string;
  message?: string;
  outage: Outage;
}

export interface CreateOutageResponseType {
  error?: string;
  message?: string;
  outage?: Outage;
  resetAt?: Date;
  remaining?: number;
  nearbyOutages?: {
    id: string;
    locationName: string;
    description: string;
    distanceKm: string;
    status: string;
    severity: string;
    affectedHomesEstimated: number;
    whatHappened: string;
    createdAt: Date;
  }[];
}
