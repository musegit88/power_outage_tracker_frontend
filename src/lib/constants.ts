import { BarChart3, Bell, Clock, Users, Zap, Map } from "lucide-react";

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

export const landingNavLinks = [
  {
    id: 1,
    title: "Features",
    hash: "features",
  },
  {
    id: 2,
    title: "How It Works",
    hash: "how-it-works",
  },
  {
    id: 3,
    title: "FAQ",
    hash: "faq",
  },
];

export const features = [
  {
    id: 1,
    title: "Real-Time Reporting",
    description:
      "Report power outages instantly from your phone. Help your community stay informed with accurate, real-time data.",
    icon: Zap,
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-500/10",
  },
  {
    id: 2,
    title: "Interactive Map",
    description:
      "See all reported outages in your area on an interactive map. Zoom, pan, and get detailed information about each incident.",
    icon: Map,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    id: 3,
    title: "Community Verified",
    description:
      "Confirm outages reported by others. Multiple confirmations increase accuracy and help everyone stay informed.",
    icon: Users,
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
  },
  {
    id: 4,
    title: "Smart Notifications",
    description:
      "Get instant alerts when outages are reported near you. Stay ahead and plan accordingly.",
    icon: Bell,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
  },
  {
    id: 5,
    title: "Outage Analytics",
    description:
      "Track patterns and frequency of power issues in your neighborhood. Historical data helps identify problem areas",
    icon: BarChart3,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
  },
  {
    id: 6,
    title: "Restoration Updates",
    description:
      "Get notified when power is restored in your area. Know when it's safe to return home or resume operations.",
    icon: Clock,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
  },
];

export const steps = [
  {
    id: 1,
    title: "Report",
    description:
      "Experiencing an outage? Drop a pin on the map and add details. Takes just 30 seconds.",
  },
  {
    id: 2,
    title: "Confirm",
    description:
      "See reports from neighbors and confirm if you're affected too. Build community accuracy.",
  },
  {
    id: 3,
    title: "Stay Updated",
    description:
      "Get notified when power is restored. Track progress and plan your day accordingly.",
  },
];

export const faq = [
  {
    value: "item-1",
    trigger: "Is this service free?",
    content:
      "Yes! PowerSignal is completely free to use. We're community-driven and ad-free. Our mission is to help communities stay informed during power outages.",
  },
  {
    value: "item-2",
    trigger: "How accurate are the reports?",
    content:
      "Reports are verified by community confirmations. When multiple users confirm an outage, accuracy increases significantly. We maintain a 95% accuracy rate.",
  },
  {
    value: "item-3",
    trigger: "Do you share my exact location?",
    content:
      "No. We only show approximate areas on the map to protect user privacy. Your exact address is never shared publicly.",
  },
  {
    value: "item-4",
    trigger: "Can I use this on mobile?",
    content:
      "Yes! Our web app works perfectly on all devices. We also have native mobile apps coming soon for iOS and Android.",
  },
];
