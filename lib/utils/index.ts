import type { JobType } from "@/lib/types";

const categoryRules: Array<{ category: string; keywords: string[] }> = [
  { category: "Tech & Engineering", keywords: ["engineer", "developer", "software", "frontend", "backend"] },
  { category: "AI & Data Science", keywords: ["data", "machine learning", "ml", "ai", "nlp"] },
  { category: "DevOps & Cloud", keywords: ["devops", "sre", "kubernetes", "cloud", "platform"] },
  { category: "Design & Creative", keywords: ["designer", "ux", "ui", "product design", "visual"] },
  { category: "Marketing & Growth", keywords: ["marketing", "growth", "seo", "content", "brand"] },
  { category: "Sales & Business Dev", keywords: ["sales", "account executive", "business development"] },
  { category: "Customer Support", keywords: ["support", "customer", "success", "helpdesk"] },
  { category: "Product & Management", keywords: ["product manager", "program manager", "project manager"] }
];

export function formatSalary(min: number | null, max: number | null, currency = "USD"): string {
  if (!min && !max) {
    return "Not disclosed";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  });

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  if (min) {
    return `From ${formatter.format(min)}`;
  }

  return `Up to ${formatter.format(max as number)}`;
}

export function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;

  if (diffMs < minute) return "just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} minutes ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} hours ago`;
  if (diffMs < month) return `${Math.floor(diffMs / day)} days ago`;
  return `${Math.floor(diffMs / month)} months ago`;
}

export function truncateText(text: string, length: number): string {
  if (!text || text.length <= length) {
    return text;
  }
  return `${text.slice(0, Math.max(0, length - 3)).trimEnd()}...`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function detectCategory(title: string, tags: string[] = []): string {
  const haystack = `${title} ${tags.join(" ")}`.toLowerCase();

  for (const rule of categoryRules) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.category;
    }
  }

  return "Operations & Logistics";
}

export function normalizeJobType(raw: string | null | undefined): JobType {
  const value = (raw ?? "").toLowerCase();

  if (value.includes("intern")) return "internship";
  if (value.includes("contract") || value.includes("temporary")) return "contract";
  if (value.includes("part")) return "part-time";
  if (value.includes("freelance")) return "freelance";
  return "full-time";
}
