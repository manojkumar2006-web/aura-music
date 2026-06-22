/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

export interface FloatingButtonProps {
  variant?: 'primary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  onClick,
  disabled = false,
  className = '',
  id,
}) => {
  // Base classes according to UI specifications
  const baseClasses = 'relative inline-flex items-center justify-center font-display font-medium select-none focus:outline-none transition-colors duration-200';
  
  // Dimensions and padding
  const sizeClasses = {
    sm: variant === 'icon' ? 'w-9 h-9 text-sm' : 'px-4 py-1.5 text-xs rounded-full',
    md: variant === 'icon' ? 'w-11 h-11 text-base' : 'px-6 py-2.5 text-sm rounded-full',
    lg: variant === 'icon' ? 'w-14 h-14 text-lg' : 'px-8 py-3.5 text-base rounded-full',
  };

  // Color theme backgrounds
  const variantClasses = {
    primary: 'bg-white/10 hover:bg-white/15 text-cyan-300 border border-cyan-500/20 rounded-full backdrop-blur-md',
    ghost: 'bg-transparent text-slate-300 hover:text-white rounded-full',
    icon: 'bg-white/5 border border-white/10 rounded-full text-slate-200 hover:text-cyan-300 hover:border-cyan-500/20 backdrop-blur-md',
  };

  // Focus ring style matching our custom free glow theme
  const focusClasses = 'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e27]';

  // Floating spring configuration
  const floatSpring = {
    type: 'spring',
    stiffness: 300,
    damping: 18,
    mass: 0.8,
  };

  // GPU precomputations - we isolate the glow and shadow animations on absolute overlay elements 
  // to avoid causing heavy repaint cycles on shadow blur triggers.
  return (
    <motion.button
      id={id || `floating-btn-${variant}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${focusClasses}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      // Anti-gravity float animation using spring physics
      whileHover={disabled ? {} : {
        y: -5,
        scale: 1.05,
      }}
      whileTap={disabled ? {} : {
        y: 2,
        scale: 0.96,
      }}
      transition={floatSpring}
    >
      {/* 
        GPU Acceleration: Shadow Expansion crossfade layers 
        Instead of modifying box-shadow directly, we absolute-position 
        the deep shadow background and composite it with opacity.
      */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300 opacity-60"
        style={{
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          zIndex: -2,
        }}
      />
      
      {/* 
        Hover Glow Layer: Active on hovering the primary/icon variants.
        Uses our CSS cyan glow variables for identity coupling.
      */}
      {variant !== 'ghost' && (
        <div 
          className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 hover:opacity-100"
          style={{
            boxShadow: `0 0 20px var(--glow-free)`,
            zIndex: -1,
          }}
        />
      )}

      {/* Button Content */}
      <span className="flex items-center gap-2 relative z-10">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
};
