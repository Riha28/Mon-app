import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

export const API_URL = API;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export function mediaUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return pathOrUrl;
}

export function isVideo(url) {
  return /\.(mp4|webm|mov|quicktime)(\?|\/|$)/i.test(url || "");
}

export function apiError(e) {
  const d = e?.response?.data?.detail;
  if (d == null) return ""; 
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    return d.map((x) => (x && typeof x.msg === "string" ? x.msg : JSON.stringify(x))).join(", ");
  }
  if (d && typeof d.message === "string") return d.message;
  if (d && typeof d.msg === "string") return d.msg;
  return String(d);
}
