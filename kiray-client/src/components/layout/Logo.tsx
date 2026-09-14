'use client';

import React from 'react';
import Image from 'next/image';

export interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark'; // 'light' is dark text for light bg; 'dark' is white text for dark bg
  showMotto?: boolean;
  mottoText?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
  showMotto = true,
  mottoText = 'Find your next home.',
  onClick,
}) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : size === 'xl' ? 56 : 36;
  const textSize =
    size === 'sm'
      ? 'text-xl'
      : size === 'lg'
      ? 'text-3xl'
      : size === 'xl'
      ? 'text-4xl'
      : 'text-2xl';
  const subSize =
    size === 'sm'
      ? 'text-[10px]'
      : size === 'lg'
      ? 'text-xs'
      : size === 'xl'
      ? 'text-sm'
      : 'text-[11px]';

  return (
    <div
      id="kiray-brand-logo"
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${
        onClick ? 'cursor-pointer' : ''
      } group ${className}`}
    >
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Kiray Logo"
          width={iconSize}
          height={iconSize}
          className="transition-transform group-hover:scale-105 duration-200 object-contain"
          priority
        />
      </div>

      <div className="flex flex-col leading-tight">
        <span
          className={`font-display font-extrabold tracking-tight ${
            variant === 'dark' ? 'text-white' : 'text-slate-900'
          } ${textSize}`}
        >
          Kiray
        </span>
        {showMotto && (
          <span className={`font-semibold tracking-normal text-orange-600 ${subSize}`}>
            {mottoText}
          </span>
        )}
      </div>
    </div>
  );
};
