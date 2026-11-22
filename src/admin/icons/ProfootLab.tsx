import * as React from 'react';
import { useTheme } from 'styled-components';

/**
 * Profoot Lab menu icon: a football (outline ring, filled centre pentagon, seams).
 *
 * Drawn only with filled `<path>`s, like @strapi/icons: the admin menu recolours its icons on
 * hover/active through a `svg path { fill }` CSS rule, which would not reach strokes or other
 * shapes. The menu also passes `fill` as a theme colour name (e.g. "neutral500"), resolved here
 * the same way the built-in icons do.
 */
export const ProfootLab = ({ fill = 'currentColor', ...props }: React.SVGProps<SVGSVGElement>) => {
  const colors = useTheme()?.colors;
  const resolvedFill = colors && fill in colors ? colors[fill as keyof typeof colors] : fill;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={16}
      height={16}
      fill={resolvedFill}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M16 1.8a14.2 14.2 0 1 1 0 28.4a14.2 14.2 0 1 1 0-28.4zM16 4.2a11.8 11.8 0 1 0 0 23.6a11.8 11.8 0 1 0 0-23.6z"
      />
      <path d="M16 11L20.76 14.45L18.94 20.05L13.06 20.05L11.24 14.45z" />
      <path d="M16.95 11.5L16.95 3.8L15.05 3.8L15.05 11.5zM20.57 15.51L27.9 13.13L27.31 11.33L19.99 13.71zM17.88 20.2L22.4 26.43L23.94 25.31L19.41 19.08zM12.59 19.08L8.06 25.31L9.6 26.43L14.12 20.2zM12.01 13.71L4.69 11.33L4.1 13.13L11.43 15.51z" />
    </svg>
  );
};
