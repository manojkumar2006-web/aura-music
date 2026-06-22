/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Lock } from 'lucide-react';
import { FloatingButton } from '../buttons/FloatingButton';

// 1. PremiumBadge - A floating premium badge (ocean to teal red ramp)
export const PremiumBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[var(--color-crushed-berry)] to-[#c41e3a] text-ink-primary text-xs font-semibold rounded-full shadow-[0_4px_12px_rgba(136,13,30,0.3)] border border-teal/20 ${className}`}
      animate={{
        y: [0, -3, 0],
      }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      }}
    >
      <Crown className="w-3 h-3 fill-ink-primary" />
      <span className="font-display tracking-wider uppercase text-[10px]">Premium</span>
    </motion.div>
  );
};

// 2. PremiumCardProps & PremiumCard
interface PremiumCardProps {
  isLocked: boolean;
  children: React.ReactNode;
  featureName: string;
  onUpgradeClick: () => void;
  tierLevel?: 'Premium' | 'Premium+';
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  isLocked,
  children,
  featureName,
  onUpgradeClick,
  tierLevel = 'Premium'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.stopPropagation();
      onUpgradeClick();
    }
  };

  const lockVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: [1, 1.2, 1],
      y: [0, -4, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'loop' as const,
        ease: 'easeInOut'
      }
    }
  };

  if (!isLocked) {
    return <div className="w-full h-full">{children}</div>;
  }

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl w-full h-full transition-all duration-300 cursor-pointer"
      style={{
        background: '#282327' // matches shadow-grey void background
      }}
    >
      {/* 
        Conic gradient rotating border behind the card to create a 
        "charging up" animated border glow on hover
      */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl pointer-events-none p-[1.5px]"
            style={{
              zIndex: 1,
              background: 'conic-gradient(from 0deg, transparent, #880d1e, transparent, #c41e3a, transparent)',
              boxShadow: '0 0 25px rgba(136, 13, 30, 0.25)'
            }}
          >
            {/* Inner mask to keep border thin */}
            <div className="w-full h-full rounded-2xl bg-[#282327]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        Rotating Border Conic Angle Driver (GPU accelerated)
      */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none -z-10"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
          style={{
            background: 'conic-gradient(from 0deg, transparent, #880d1e, transparent, #c41e3a, transparent)',
          }}
        />
      )}

      {/* 
        Locked Content visual overlay
        Grayscale and dimmed at rest, focus increases slightly on hover
      */}
      <div 
        className={`w-full h-full transition-all duration-300 relative z-0 ${
          isHovered 
            ? 'opacity-90 filter grayscale-[10%]' 
            : 'opacity-70 filter grayscale-[30%]'
        }`}
      >
        {children}
      </div>

      {/* Lock badge in top-right corner */}
      <div className="absolute top-3.5 right-3.5 z-20">
        <motion.div
          className="p-1.5 border border-teal/30 bg-[#282327]/90 backdrop-blur-md rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] text-teal"
          variants={lockVariants}
          animate={isHovered ? "hover" : "rest"}
        >
          <Lock className="w-3.5 h-3.5" />
        </motion.div>
      </div>

      {/* Tooltip Overlay sliding in from bottom */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute bottom-0 inset-x-0 p-4 lock-overlay z-20 flex flex-col items-center justify-end text-center"
            onClick={(e) => e.stopPropagation()} // prevent double trigger
          >
            <p className="text-ink-primary font-display font-bold text-xs mb-2.5 flex items-center gap-1.5 justify-center">
              🔒 {tierLevel === 'Premium+' ? 'Premium+' : 'Premium'} Feature — Unlock with Antigravity+
            </p>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpgradeClick();
              }}
              className="px-4 py-1.5 btn-premium text-ink-primary text-xs font-black rounded-full active:scale-95 cursor-pointer"
            >
              Upgrade
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 3. PremiumButton
interface PremiumButtonProps {
  isLocked: boolean;
  onClick?: () => void;
  onUpgradeClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  tierLevel?: 'Premium' | 'Premium+';
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  isLocked,
  onClick,
  onUpgradeClick,
  children,
  icon,
  size = 'md',
  className = '',
  tierLevel = 'Premium'
}) => {
  const handlePress = () => {
    if (isLocked) {
      onUpgradeClick();
    } else if (onClick) {
      onClick();
    }
  };

  // If unlocked, behaves like a normal FloatingButton (cyan glow, standard styling)
  if (!isLocked) {
    return (
      <FloatingButton
        variant="primary"
        size={size}
        icon={icon}
        onClick={onClick}
        className={className}
      >
        {children}
      </FloatingButton>
    );
  }

  // Dimension scaling matching FloatingButton
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const isPlus = tierLevel === 'Premium+';

  return (
    <motion.button
      onClick={handlePress}
      className={`
        relative overflow-hidden inline-flex items-center justify-center font-display font-bold select-none cursor-pointer rounded-full backdrop-blur-md border 
        ${isPlus 
          ? 'btn-premium shimmer-sweep border-white/20 text-ink-primary' 
          : 'btn-premium border-white/10 text-ink-primary'
        }
        ${sizeClasses[size]}
        ${className}
      `}
      whileHover={{
        y: -5,
        scale: 1.05,
      }}
      whileTap={{
        y: 2,
        scale: 0.96,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 18,
        mass: 0.8,
      }}
    >
      {/* Warmer glow active on hover (teal-red for Premium & Premium+) */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300 opacity-0 hover:opacity-100"
        style={{
          boxShadow: '0 0 25px rgba(136, 13, 30, 0.65)',
          zIndex: -1,
        }}
      />

      {/* Shimmer effect sweeping across premium buttons every few seconds even without hover */}
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent -skew-x-25 pointer-events-none"
        style={{ left: '-100%', zIndex: 1 }}
        animate={{
          left: ['-100%', '200%'],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 5.5,
          ease: 'easeInOut',
        }}
      />

      {/* Button Content */}
      <span className="flex items-center gap-2 relative z-10">
        <Crown className={`w-4 h-4 flex-shrink-0 fill-ink-primary text-ink-primary`} />
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
};


