import React from 'react';

export const GeminiIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-6 h-6 ${className ?? ''}`}
    {...rest}
  >
    <path d="M12.75 2.75a.75.75 0 0 0-1.5 0V6h-4a.75.75 0 0 0 0 1.5h4v3.56a6.53 6.53 0 0 0-4.74-2.23.75.75 0 0 0-.53 1.36 5.03 5.03 0 0 1 4.27 2.81H2.75a.75.75 0 0 0 0 1.5h10.51a5.03 5.03 0 0 1-4.27 2.81.75.75 0 0 0 .53 1.36 6.53 6.53 0 0 0 4.74-2.23V21.25a.75.75 0 0 0 1.5 0V18h4a.75.75 0 0 0 0-1.5h-4v-3.56c2.47.76 4.24 3.05 4.24 5.79a.75.75 0 0 0 1.5 0c0-3.6-2.54-6.61-6.24-7.47V7.5h4a.75.75 0 0 0 0-1.5h-4V2.75Z" />
  </svg>
);

