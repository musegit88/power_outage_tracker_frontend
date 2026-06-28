export const navLinks = [
  {
    id: 1,
    title: "Live Map",
    pathname: "/live-map",
  },
  {
    id: 2,
    title: "Report Outage",
    pathname: "/report",
  },
];

export const reportFormNavigation = [
  {
    id: 1,
    title: "Location",
    hash: "location",
  },
  {
    id: 2,
    title: "Details",
    hash: "details",
  },
  {
    id: 3,
    title: "Additional Context",
    hash: "context",
  },
  {
    id: 4,
    title: "Severity",
    hash: "severity",
  },
];

export const OutageStatus = {
  ACTIVE: "ACTIVE",
  RESOLVED: "RESOLVED",
  INVESTIGATING: "INVESTIGATING",
};

export const filters = [
  {
    id: 1,
    title: "Active",
    value: OutageStatus.ACTIVE,
    borderColor: "border-red-500",
  },
  {
    id: 2,
    title: "Investigating",
    value: OutageStatus.INVESTIGATING,
    borderColor: "border-yellow-500",
  },
  {
    id: 3,
    title: "Resolved",
    value: OutageStatus.RESOLVED,
    borderColor: "border-green-500",
  },
];
