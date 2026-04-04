import React from 'react';

interface CortexLogoProps {
  className?: string;
  size?: number;
}

export const CortexLogo: React.FC<CortexLogoProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Halo */}
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 4" />
      
      {/* Hexagonal Core Grid */}
      <path d="M50 15L80 32.5V67.5L50 85L20 67.5V32.5L50 15Z" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" />
      
      {/* Neural Nodes (Strategic Points) */}
      <circle cx="50" cy="15" r="3" fill="currentColor" />
      <circle cx="80" cy="32.5" r="2" fill="currentColor" fillOpacity="0.5" />
      <circle cx="80" cy="67.5" r="3" fill="currentColor" />
      <circle cx="50" cy="85" r="2" fill="currentColor" fillOpacity="0.5" />
      <circle cx="20" cy="67.5" r="3" fill="currentColor" />
      <circle cx="20" cy="32.5" r="2" fill="currentColor" fillOpacity="0.5" />
      <circle cx="50" cy="50" r="5" fill="currentColor" className="animate-pulse" />

      {/* Interconnecting Synapses */}
      <line x1="50" y1="15" x2="50" y2="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="80" y1="32.5" x2="50" y2="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="80" y1="67.5" x2="50" y2="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="50" y1="85" x2="50" y2="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="20" y1="67.5" x2="50" y2="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="20" y1="32.5" x2="50" y2="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      
      {/* Tactical Glow (SVG Filter) */}
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
};
