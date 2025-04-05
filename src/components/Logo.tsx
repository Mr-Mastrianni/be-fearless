import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ width = 40, height = 40, className = '' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Simple courage-themed logo */}
      <rect width="512" height="512" rx="100" fill="#FFFFFF" stroke="#000000" strokeWidth="24"/>
      <path d="M256 120C194.157 120 144 170.157 144 232C144 293.843 194.157 344 256 344C317.843 344 368 293.843 368 232C368 170.157 317.843 120 256 120Z" fill="#000000"/>
      <path d="M256 150C210.817 150 174 186.817 174 232C174 277.183 210.817 314 256 314C301.183 314 338 277.183 338 232C338 186.817 301.183 150 256 150Z" fill="#FFFFFF"/>
      <path d="M226 212C226 225.255 215.255 236 202 236C188.745 236 178 225.255 178 212C178 198.745 188.745 188 202 188C215.255 188 226 198.745 226 212Z" fill="#000000"/>
      <path d="M334 212C334 225.255 323.255 236 310 236C296.745 236 286 225.255 286 212C286 198.745 296.745 188 310 188C323.255 188 334 198.745 334 212Z" fill="#000000"/>
      <path d="M184 380C184 364.536 196.536 352 212 352H300C315.464 352 328 364.536 328 380V380C328 395.464 315.464 408 300 408H212C196.536 408 184 395.464 184 380V380Z" fill="#000000"/>
    </svg>
  );
};

export default Logo;
