import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function timeAgo(isoStr, lang = "fr") {
  if (!isoStr) return "";
  const diff = Math.max(0, (Date.now() - new Date(isoStr).getTime()) / 1000);
  const fr = lang !== "en";
  if (diff < 60) return fr ? "à l'instant" : "just now";
  const m = Math.floor(diff / 60);
  if (m < 60) return fr ? `il y a ${m} min` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return fr ? `il y a ${h} h` : `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return fr ? `il y a ${d} j` : `${d}d ago`;
  const mo = Math.floor(d / 30);
  return fr ? `il y a ${mo} mois` : `${mo}mo ago`;
}

