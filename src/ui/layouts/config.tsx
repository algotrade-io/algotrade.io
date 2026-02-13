/**
 * Layout Configuration
 * Shared configuration for header, auth, and routing.
 */

import { createTheme, defaultTheme } from '@aws-amplify/ui-react';
import { domain } from '@/utils';
import overrides from './index.module.less';

// Amplify auth theme
export const authTheme = createTheme({
  name: 'dark-mode-theme',
  overrides: [
    {
      colorMode: 'dark',
      tokens: {
        colors: {
          neutral: {
            10: defaultTheme.tokens.colors.neutral[100],
            20: defaultTheme.tokens.colors.neutral[90],
            40: defaultTheme.tokens.colors.neutral[80],
            80: defaultTheme.tokens.colors.neutral[40],
            90: defaultTheme.tokens.colors.neutral[20],
            100: defaultTheme.tokens.colors.neutral[10],
          },
          black: { value: '#fff' },
          white: { value: '#000' },
        },
      },
    },
  ],
});

// Page configuration
export const pages: string[] = [
  'docs',
  'algorithm',
  'subscription',
  'alerts',
  'contact',
];

// Helper functions
const capitalize = (s: string | any[]) => s[0].toUpperCase() + s.slice(1);
const [prefix, suffix] = domain.split('.');

// Navigation routes
export const routes = [
  {
    text: (
      <>
        <div className={overrides.home}>
          <span style={{ textTransform: 'capitalize' }} className={overrides.white}>
            {prefix}
          </span>
          <span>{`.${suffix}`}</span>
        </div>
      </>
    ),
    to: '',
  },
].concat(pages.map((page) => ({ text: capitalize(page), to: page })));

// Layout dimensions
export const headerHeight = 64;
export const footerHeight = headerHeight;
