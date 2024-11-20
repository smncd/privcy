import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-GB',
  title: 'Privcy',
  description: 'Tiny consent/cookie banner',
  head: [
    [
      'script',
      {
        src: 'https://cdn.jsdelivr.net/npm/privcy/dist/privcy.js',
      },
    ],
    ['script', { src: '/_assets/js/privcy.js' }],
    [
      'script',
      {
        defer: '',
        'data-website-id': '5388c973-7427-4088-a49c-d96a43feed68',
        'data-privcy': JSON.stringify({
          category: 'analytics',
          src: 'https://analytics.smn.codes/script.js',
        }),
      },
    ],
  ],
  themeConfig: {
    logo: {
      light: '/_assets/vectors/logo-light.svg',
      dark: '/_assets/vectors/logo-dark.svg',
      alt: 'Privcy',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guides', link: '/guides' },
      { text: 'Reference', link: '/reference' },
    ],
    sidebar: [
      {
        text: 'Guides',
        items: [
          {
            text: 'Quick-start',
            link: '/guides/quick-start',
          },
          {
            text: 'Single Page Applications',
            link: '/guides/single-page-applications',
          },
        ],
      },
      {
        text: 'Reference',
        items: [
          {
            text: 'Privcy()',
            link: '/reference/privcy',
            collapsed: true,
            items: [
              {
                text: 'Props',
                link: '/reference/privcy#props',
              },
              {
                text: 'Methods',
                link: '/reference/privcy#methods',
              },
            ],
          },
        ],
      },
      {
        text: 'Help',
        items: [
          {
            text: 'Troubleshooting',
            link: '/help/troubleshooting',
          },
          {
            text: 'Report a vulnerability',
            link: '/help/report-a-vulnerability',
          },
        ],
      },
    ],
    socialLinks: [
      { icon: 'gitlab', link: 'https://gitlab.com/smncd/privcy' },
      { icon: 'github', link: 'https://github.com/smncd/privcy' },
      { icon: 'npm', link: 'https://npmjs.com/package/privcy' },
    ],
    footer: {
      message:
        'Released under the BSD-3-Clause License. · <button data-privcy-display-banner>Privacy settings</button>',
      copyright: 'Copyright © 2024 Simon Lagerlöf',
    },
  },
});
