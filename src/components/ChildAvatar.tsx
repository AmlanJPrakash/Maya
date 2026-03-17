import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Baby, Sun, Moon } from 'lucide-react';
import { ChildProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChildAvatarProps {
  child: ChildProfile;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isTyping?: boolean;
  className?: string;
}

export default function ChildAvatar({ size = 'md', isTyping = false, className }: ChildAvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const config = {
    color: 'bg-maya-olive/10',
    glow: 'shadow-maya-olive/10',
    accent: 'text-maya-olive/40',
    icon: <Baby className={iconSizes[size]} />,
    animation: {
      scale: [1, 1.02, 1],
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Outer Glow/Aura */}
      <motion.div
        animate={{
          scale: isTyping ? [1, 1.2, 1] : config.animation.scale,
          opacity: isTyping ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: isTyping ? 1.5 : 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={cn(
          "absolute inset-0 rounded-full blur-xl",
          config.color
        )}
      />

      {/* Main Avatar Body */}
      <motion.div
        animate={isTyping ? {
          y: [0, -4, 0],
          scale: [1, 1.05, 1]
        } : config.animation}
        transition={{
          duration: isTyping ? 0.6 : 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={cn(
          "relative z-10 w-full h-full rounded-full bg-white flex items-center justify-center border border-white/80 shadow-2xl transition-colors duration-1000",
          config.glow
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isTyping ? 'typing' : 'avatar'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn("transition-colors duration-1000", config.accent)}
          >
            {isTyping ? (
              <div className="flex gap-1">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }} 
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="w-1.5 h-1.5 rounded-full bg-current" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }} 
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-current" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }} 
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-1.5 h-1.5 rounded-full bg-current" 
                />
              </div>
            ) : (
              config.icon
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Decorative Rings */}
      <div className="absolute inset-[-4px] rounded-full border border-white/20 pointer-events-none" />
      <div className="absolute inset-[-8px] rounded-full border border-white/10 pointer-events-none" />
    </div>
  );
}
