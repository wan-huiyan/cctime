import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'cctime',
  description: 'Real-time Claude Code session analytics',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/cli' },
      { text: 'GitHub', link: 'https://github.com/dioptx/cctime' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Live Mode', link: '/guide/live-mode' },
          { text: 'Time Breakdown', link: '/guide/time-breakdown' },
          { text: 'Cost Tracking', link: '/guide/cost-tracking' },
          { text: 'Filtering & Export', link: '/guide/filtering' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'CLI Reference', link: '/reference/cli' },
          { text: 'JSON Schema', link: '/reference/json-schema' },
          { text: 'Pricing Table', link: '/reference/pricing' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/dioptx/cctime' },
    ],
    footer: {
      message: 'Released under the MIT License.',
    },
  },
});
