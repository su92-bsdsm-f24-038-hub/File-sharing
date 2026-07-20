import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DeviceType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
  const totalSecs = Math.ceil(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export interface LastDevice {
  deviceName: string;
  deviceType: DeviceType;
}

const LAST_DEVICE_KEY = "sync_last_device";

export function setLastDevice(device: LastDevice) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_DEVICE_KEY, JSON.stringify(device));
}

export function getLastDevice(): LastDevice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_DEVICE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLastDevice() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LAST_DEVICE_KEY);
}

export function generateTransferId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export function parseUserAgent(ua: string): { deviceName: string; deviceType: DeviceType } {
  const uaLower = ua.toLowerCase();
  
  let deviceType: DeviceType = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(uaLower)) {
    deviceType = "tablet";
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    deviceType = "mobile";
  }

  let browser = "Unknown Browser";
  if (uaLower.includes("firefox")) browser = "Firefox";
  else if (uaLower.includes("edg/")) browser = "Edge";
  else if (uaLower.includes("chrome") && !uaLower.includes("edg/")) browser = "Chrome";
  else if (uaLower.includes("safari") && !uaLower.includes("chrome")) browser = "Safari";
  else if (uaLower.includes("opr/") || uaLower.includes("opera")) browser = "Opera";

  let os = "Unknown OS";
  if (uaLower.includes("windows")) os = "Windows";
  else if (uaLower.includes("mac os x") || uaLower.includes("macintosh")) os = "Mac";
  else if (uaLower.includes("android")) os = "Android";
  else if (uaLower.includes("iphone") || uaLower.includes("ipad")) os = "iOS";
  else if (uaLower.includes("linux")) os = "Linux";

  return { deviceName: `${browser} on ${os}`, deviceType };
}
