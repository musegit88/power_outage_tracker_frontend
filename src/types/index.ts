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
