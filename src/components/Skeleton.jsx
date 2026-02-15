import React from 'react';
import '../styles/skeleton.css';

export const SkeletonText = ({ width = '100%', height = '1em', className = '' }) => (
  <div 
    className={`skeleton skeleton-text ${className}`} 
    style={{ width, height }}
  />
);

export const SkeletonAvatar = ({ size = 100 }) => (
  <div 
    className="skeleton skeleton-avatar" 
    style={{ width: size, height: size }}
  />
);

export const SkeletonCard = ({ children }) => (
  <div className="skeleton skeleton-card">
    {children}
  </div>
);

export const SkeletonButton = ({ width = '120px' }) => (
  <div className="skeleton skeleton-button" style={{ width }} />
);

export const SkeletonNavItem = () => (
  <div className="skeleton skeleton-nav-item" />
);

export const SkeletonGalleryItem = () => (
  <div className="skeleton skeleton-gallery-item" />
);

export const SkeletonLanyard = () => (
  <div className="skeleton skeleton-lanyard" />
);
