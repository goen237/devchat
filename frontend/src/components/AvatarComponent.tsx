import React from 'react';
import { getAvatarUrl } from '../types';

interface AvatarProps {
  src?: string | null;
  username: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  username, 
  size = 'medium', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base', 
    large: 'w-16 h-16 text-xl'
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // 🔥 FIXED: Verwende zentrale getAvatarUrl Funktion

  if (src) {
    return (
      <div className={`${className} inline-block`}>
        <img
          src={getAvatarUrl(src)}
          alt={username}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
          onError={(e) => {
            // Fallback wenn Bild nicht lädt
            console.warn(`Avatar-Bild konnte nicht geladen werden: ${src}`);
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.classList.remove('hidden');
            }
          }}
        />
        {/* Hidden Fallback */}
        <div className={`${sizeClasses[size]} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium hidden`}>
          {getInitials(username)}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium ${className}`}>
      {getInitials(username)}
    </div>
  );
};

export default Avatar;