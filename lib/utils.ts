import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a random slug for submissions
 * Format: [6 alphanumeric chars]-[timestamp]
 */
export function generateRandomSlug(): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36);

  return `${result}-${timestamp}`;
}
