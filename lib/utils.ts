import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 7)   return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function wordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ')
  return text.trim().split(/\s+/).filter(Boolean).length
}

export const NOTE_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  pink:     { bg: 'bg-pink-50',    accent: 'from-pink-300 to-pink-400',   text: 'text-pink-700' },
  rose:     { bg: 'bg-rose-50',    accent: 'from-rose-300 to-pink-400',   text: 'text-rose-700' },
  lavender: { bg: 'bg-purple-50',  accent: 'from-purple-300 to-purple-400', text: 'text-purple-700' },
  mint:     { bg: 'bg-green-50',   accent: 'from-green-300 to-teal-400',  text: 'text-green-700' },
  peach:    { bg: 'bg-orange-50',  accent: 'from-orange-200 to-orange-300', text: 'text-orange-700' },
  sky:      { bg: 'bg-sky-50',     accent: 'from-sky-200 to-blue-300',    text: 'text-sky-700' },
  cream:    { bg: 'bg-cream-100',  accent: 'from-pink-100 to-pink-200',   text: 'text-pink-600' },
}

export const TT_COLORS: Record<string, string> = {
  pink:     'bg-pink-100 text-pink-800',
  lavender: 'bg-purple-100 text-purple-800',
  mint:     'bg-green-100 text-green-800',
  peach:    'bg-orange-100 text-orange-800',
  sky:      'bg-sky-100 text-sky-800',
  rose:     'bg-rose-100 text-rose-800',
}

export const PRIORITY_STYLES = {
  high:   'bg-pink-400',
  medium: 'bg-pink-300',
  low:    'bg-pink-100 border border-pink-200',
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function formatLongDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
