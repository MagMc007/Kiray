'use client';

import React from 'react';

/**
 * Curated palette of accessible, visually distinct background colors
 * paired with contrasting text colors for initials.
 */
const AVATAR_PALETTES = [
  { bg: '#E8544E', text: '#FFFFFF' }, // Red
  { bg: '#D97706', text: '#FFFFFF' }, // Amber
  { bg: '#059669', text: '#FFFFFF' }, // Emerald
  { bg: '#2563EB', text: '#FFFFFF' }, // Blue
  { bg: '#7C3AED', text: '#FFFFFF' }, // Violet
  { bg: '#DB2777', text: '#FFFFFF' }, // Pink
  { bg: '#0891B2', text: '#FFFFFF' }, // Cyan
  { bg: '#4F46E5', text: '#FFFFFF' }, // Indigo
  { bg: '#0D9488', text: '#FFFFFF' }, // Teal
  { bg: '#C2410C', text: '#FFFFFF' }, // Orange
  { bg: '#9333EA', text: '#FFFFFF' }, // Purple
  { bg: '#0284C7', text: '#FFFFFF' }, // Sky
] as const;

/**
 * Simple deterministic hash from a string to pick a consistent color
 * for the same user name across sessions and components.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit int
  }
  return Math.abs(hash);
}

/**
 * Extract initials from a display name.
 * - "Dawit Bekele" → "DB"
 * - "Dawit" → "D"
 * - "" / null → "?"
 */
function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

const SIZE_MAP = {
  xs: { dimension: 'w-7 h-7', fontSize: 'text-[10px]' },
  sm: { dimension: 'w-9 h-9', fontSize: 'text-xs' },
  md: { dimension: 'w-14 h-14', fontSize: 'text-lg' },
  lg: { dimension: 'w-16 h-16', fontSize: 'text-xl' },
} as const;

export type AvatarSize = keyof typeof SIZE_MAP;

export interface UserAvatarProps {
  /** User's display name — used for initials and color hashing */
  name?: string | null;
  /** Photo URL — if provided and truthy, the image is rendered instead of initials */
  photoURL?: string | null;
  /** Preset size */
  size?: AvatarSize;
  /** Border radius class override — defaults to 'rounded-full' */
  rounded?: string;
  /** Additional className to merge onto the root element */
  className?: string;
  /** Extra ring / border classes (e.g. 'ring-1 ring-orange-500/50') */
  ring?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  photoURL,
  size = 'sm',
  rounded = 'rounded-full',
  className = '',
  ring = '',
}) => {
  const { dimension, fontSize } = SIZE_MAP[size];
  const initials = getInitials(name);
  const palette = AVATAR_PALETTES[hashString(name || '?') % AVATAR_PALETTES.length];

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name || 'User'}
        className={`${dimension} ${rounded} object-cover ${ring} ${className}`.trim()}
      />
    );
  }

  return (
    <div
      className={`${dimension} ${rounded} flex items-center justify-center font-bold ${fontSize} select-none shrink-0 ${ring} ${className}`.trim()}
      style={{ backgroundColor: palette.bg, color: palette.text }}
      aria-label={name || 'User avatar'}
    >
      {initials}
    </div>
  );
};
