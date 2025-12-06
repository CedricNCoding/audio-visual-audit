import React from 'react';
import { cn } from '@/lib/utils';

/**
 * MOTION DESIGN SYSTEM
 * Reusable motion wrapper components for consistent animations
 */

interface MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: 'fast' | 'normal' | 'slow';
}

/**
 * AnimatedPage - Wraps page content with entrance animation
 */
export const AnimatedPage: React.FC<MotionProps> = ({
  children,
  className,
  delay = 0,
}) => {
  return (
    <div
      className={cn('animate-page-enter', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * AnimatedPanel - Wraps panels with reveal animation
 */
export const AnimatedPanel: React.FC<MotionProps & { stagger?: number }> = ({
  children,
  className,
  delay = 0,
  stagger = 0,
}) => {
  const totalDelay = delay + stagger * 40;
  return (
    <div
      className={cn('animate-panel-reveal', className)}
      style={{ animationDelay: `${totalDelay}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * AnimatedCard - Wraps cards with entrance animation
 */
export const AnimatedCard: React.FC<MotionProps & { index?: number }> = ({
  children,
  className,
  delay = 0,
  index = 0,
}) => {
  const totalDelay = delay + index * 80;
  return (
    <div
      className={cn('animate-card-enter opacity-0', className)}
      style={{ animationDelay: `${totalDelay}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * AnimatedList - Wraps list with staggered entrance
 */
export const AnimatedList: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className, staggerDelay = 50 }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className="animate-list-item opacity-0"
          style={{ animationDelay: `${index * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

/**
 * AnimatedTabContent - Wraps tab content with transition
 */
export const AnimatedTabContent: React.FC<MotionProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('animate-tab-content', className)}>
      {children}
    </div>
  );
};

/**
 * FadeIn - Simple fade in wrapper
 */
export const FadeIn: React.FC<MotionProps & { direction?: 'up' | 'down' | 'left' | 'right' | 'none' }> = ({
  children,
  className,
  delay = 0,
  direction = 'up',
}) => {
  const animations = {
    up: 'animate-fade-in-up',
    down: 'animate-fade-in-up', // Can add specific down animation
    left: 'animate-slide-in-left',
    right: 'animate-slide-in-right',
    none: 'animate-fade-in',
  };

  return (
    <div
      className={cn(animations[direction], 'opacity-0', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * PopIn - Pop in animation for added elements
 */
export const PopIn: React.FC<MotionProps> = ({
  children,
  className,
  delay = 0,
}) => {
  return (
    <div
      className={cn('animate-pop-in opacity-0', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * AILoader - Animated loader for AI responses
 */
export const AILoader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="ai-loader-dot" />
      <div className="ai-loader-dot" />
      <div className="ai-loader-dot" />
    </div>
  );
};

/**
 * GlowPulse - Wrapper that adds glow pulse animation
 */
export const GlowPulse: React.FC<MotionProps & { color?: 'yellow' | 'cyan' }> = ({
  children,
  className,
  color = 'yellow',
}) => {
  return (
    <div className={cn(
      color === 'yellow' ? 'animate-glow-pulse' : 'animate-glow-pulse-cyan',
      className
    )}>
      {children}
    </div>
  );
};

/**
 * HoverLift - Wrapper that adds hover lift effect
 */
export const HoverLift: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('hover-lift cursor-pointer', className)}>
      {children}
    </div>
  );
};

/**
 * HoverGlow - Wrapper that adds hover glow effect
 */
export const HoverGlow: React.FC<{
  children: React.ReactNode;
  className?: string;
  color?: 'yellow' | 'cyan';
}> = ({ children, className, color = 'cyan' }) => {
  return (
    <div className={cn(
      color === 'yellow' ? 'hover-glow-yellow' : 'hover-glow-cyan',
      className
    )}>
      {children}
    </div>
  );
};
