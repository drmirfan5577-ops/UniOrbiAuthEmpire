import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getSecurityScoreColor(score: number): string {
  if (score >= 95) return "#10b981";
  if (score >= 85) return "#0ea5e9";
  if (score >= 75) return "#f59e0b";
  if (score >= 60) return "#f97316";
  return "#f43f5e";
}

export function getSecurityScoreLabel(score: number): string {
  if (score >= 95) return "Fortress";
  if (score >= 85) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Medium";
  if (score >= 40) return "Low";
  return "Critical";
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  const masked = user.substring(0, 2) + "****" + user.substring(user.length - 1);
  return `${masked}@${domain}`;
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{4})\d{4}(\d{4})/, "$1****$2");
}

export function calculatePasswordStrength(password: string): "weak" | "medium" | "strong" | "fortress" {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 16) score++;

  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  if (score <= 4) return "strong";
  return "fortress";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "…";
}
