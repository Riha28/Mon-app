import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const api = {
  get: () => Promise.resolve({ data: {} }),
  post: () => Promise.resolve({ data: {} }),
  put: () => Promise.resolve({ data: {} }),
  delete: () => Promise.resolve({ data: {} })
};

export function mediaUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return pathOrUrl;
}

export function isVideo(url) {
  return /\.(mp4|webm|mov|quicktime)(\?|\/|$)/i.test(url || "");
}

export function apiError(e) {
  return "";
}
