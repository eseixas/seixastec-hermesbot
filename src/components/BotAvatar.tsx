import React from 'react';
import { BotAvatarShape } from '../types/hermes';

interface BotAvatarProps {
  shape?: BotAvatarShape;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const BotAvatar: React.FC<BotAvatarProps> = ({
  shape = 'ghost',
  color = '#8b5cf6',
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const dimension = sizeMap[size] || sizeMap.md;

  // Render vector avatar based on shape
  const renderShape = () => {
    switch (shape) {
      case 'drop':
        return (
          <path
            d="M24 6 C24 6 12 18 12 28 C12 34.6 17.4 40 24 40 C30.6 40 36 34.6 36 28 C36 18 24 6 24 6 Z"
            fill={color}
          />
        );
      case 'square':
        return (
          <rect
            x="8"
            y="8"
            width="32"
            height="32"
            rx="9"
            fill={color}
          />
        );
      case 'round':
        return (
          <circle
            cx="24"
            cy="24"
            r="16"
            fill={color}
          />
        );
      case 'cloud':
        return (
          <path
            d="M17 36 C13 36 10 33 10 29 C10 25.5 12.5 22.5 16 22.1 C17 17 21.5 13 27 13 C33 13 37.8 17.5 38 23.5 C40.8 24.5 42.5 27.2 42 30.2 C41.5 33.5 38.5 36 35 36 Z"
            fill={color}
          />
        );
      case 'triangle':
        return (
          <path
            d="M24 8 C25.5 8 27 9 27.8 10.5 L40.5 32 C41.5 33.8 40.5 36 38.5 36 L9.5 36 C7.5 36 6.5 33.8 7.5 32 L20.2 10.5 C21 9 22.5 8 24 8 Z"
            fill={color}
          />
        );
      case 'ghost':
      default:
        return (
          <path
            d="M10 22 C10 14 16.2 8 24 8 C31.8 8 38 14 38 22 L38 34 C38 36.2 36.2 38 34 38 C32.5 38 31.2 37 30.5 35.8 C29.5 34.2 27.5 34.2 26.5 35.8 C25.8 37 24.5 38 23 38 C21.5 38 20.2 37 19.5 35.8 C18.5 34.2 16.5 34.2 15.5 35.8 C14.8 37 13.5 38 12 38 C9.8 38 8 36.2 8 34 Z"
            fill={color}
          />
        );
    }
  };

  // Eyes position varies slightly depending on shape geometry
  const getEyesY = () => {
    if (shape === 'drop') return 27;
    if (shape === 'cloud') return 25;
    if (shape === 'triangle') return 27;
    return 22; // ghost, square, round
  };

  const eyesY = getEyesY();

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${dimension} ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-150"
      >
        {/* Body Shape */}
        {renderShape()}

        {/* Left Eye */}
        <circle cx="19.5" cy={eyesY} r="2.8" fill="#ffffff" />
        <circle cx="20" cy={eyesY} r="1.3" fill="#0f172a" />

        {/* Right Eye */}
        <circle cx="28.5" cy={eyesY} r="2.8" fill="#ffffff" />
        <circle cx="29" cy={eyesY} r="1.3" fill="#0f172a" />

        {/* Cute subtle eye highlights */}
        <circle cx="19" cy={eyesY - 0.8} r="0.6" fill="#ffffff" />
        <circle cx="28" cy={eyesY - 0.8} r="0.6" fill="#ffffff" />
      </svg>
    </div>
  );
};
