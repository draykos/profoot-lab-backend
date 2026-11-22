import * as React from 'react';

/**
 * Dumbbell icon for the admin menu. @strapi/icons has no gym/fitness icon, so this follows the
 * same conventions (32x32 viewBox, 16px default size, `currentColor` fill) to blend in with the
 * other menu icons, including their active/hover colors.
 */
export const Dumbbell = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    width={16}
    height={16}
    fill="currentColor"
    {...props}
  >
    <rect x="2" y="11" width="4" height="10" rx="1.5" />
    <rect x="6.5" y="7" width="4" height="18" rx="1.5" />
    <rect x="10.5" y="14.5" width="11" height="3" rx="1" />
    <rect x="21.5" y="7" width="4" height="18" rx="1.5" />
    <rect x="26" y="11" width="4" height="10" rx="1.5" />
  </svg>
);
