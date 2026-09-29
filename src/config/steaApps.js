import { STEA_SUBDOMAIN_URLS } from "../utils/subdomains.js";

export const STEA_APPS = [
  { id: "home", title: "STEA Home", icon: "🏠", url: "https://stea.africa", status: "active" },
  { id: "education", title: "Education", icon: "🎓", url: "https://stea.africa/education", status: "active" },
  { id: "notes", title: "Notes", icon: "📚", url: "https://stea.africa/education/notes", status: "active" },
  { id: "past-papers", title: "Past Papers", icon: "📄", url: "https://stea.africa/education/past-papers", status: "active" },
  { id: "results", title: "NECTA Results", icon: "📊", url: "https://stea.africa/education/results", status: "active" },
  { id: "classroom", title: "Classroom", icon: "🏫", url: STEA_SUBDOMAIN_URLS.classroom || "https://classroom.stea.africa", status: "active" },
  { id: "websites", title: "Websites", icon: "🌐", url: STEA_SUBDOMAIN_URLS.sites || "https://sites.stea.africa", status: "active" },
  { id: "marketplace", title: "Marketplace", icon: "🛍️", url: "https://stea.africa/duka", status: "active" },
  { id: "gigs-kazi", title: "Gigs & Kazi", icon: "💼", url: "https://stea.africa/gigs-kazi", status: "active" },
  { id: "creators", title: "Creators", icon: "🎬", url: "https://stea.africa/creators", status: "active" },
  { id: "services", title: "Services", icon: "💼", url: "https://stea.africa/services", status: "active" },
  { id: "vpn", title: "STEA VPN", icon: "🛡️", url: "https://steavpn.stea.africa", status: "active", keywords: ["vpn", "stea vpn", "security", "privacy"] },
  { id: "tools", title: "Digital Tools", icon: "🧰", url: "https://stea.africa/digital-tools", status: "active", keywords: ["tools", "digital", "software", "subscriptions"] },
  { id: "daily", title: "STEA Daily", icon: "📰", url: "https://stea.africa/daily", status: "active", keywords: ["news", "updates", "daily"] },
  { id: "jobs", title: "Jobs", icon: "💼", url: "https://stea.africa/jobs", status: "active", keywords: ["jobs", "careers", "vacancies"] },
  { id: "community", title: "Community", icon: "👥", url: "https://stea.africa/community", status: "active", keywords: ["community", "forum", "groups"] },
  { id: "ai", title: "AI Tools", icon: "🤖", url: "https://stea.africa/ai-tools", status: "active" },
  { id: "support", title: "Support STEA", icon: "❤️", url: "https://stea.africa/contact", status: "active" }
];
