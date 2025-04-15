import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function extractImageUrlsFromMarkdown(markdown: string): string[] {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const urls: string[] = [];
  let match;
  while ((match = imageRegex.exec(markdown)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}