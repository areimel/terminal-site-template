import { TEMPLATE } from 'astrowind:config';

import { getAsset, getPermalink } from './utils/permalinks';

/** A single entry in the site's primary or footer navigation. Also read by the shell's `ls`/`cd` commands. */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  /** Alias the `<terminal-shell>` command set accepts for `cd`/`open`, e.g. `projects` for `/projects`. */
  shellAlias?: string;
}

/** Primary site navigation, read by SidebarNavV2 and the shell's `cd`/`ls` commands. */
export const mainNav: NavItem[] = [
  { label: 'Home', href: getPermalink('/'), icon: 'tabler:home', shellAlias: 'home' },
  { label: 'Projects', href: getPermalink('/projects'), icon: 'tabler:briefcase', shellAlias: 'projects' },
  { label: 'Blog', href: getPermalink('/blog'), icon: 'tabler:article', shellAlias: 'blog' },
  { label: 'Docs', href: getPermalink('/docs'), icon: 'tabler:book-2', shellAlias: 'docs' },
  { label: 'Components', href: getPermalink('/components'), icon: 'tabler:puzzle', shellAlias: 'components' },
  { label: 'App', href: getPermalink('/app'), icon: 'tabler:layout-dashboard', shellAlias: 'app' },
  { label: 'Terminal', href: getPermalink('/terminal'), icon: 'tabler:terminal-2', shellAlias: 'terminal' },
  { label: 'Contact', href: getPermalink('/contact'), icon: 'tabler:mail', shellAlias: 'contact' },
];

/** Secondary/legal navigation, read by Footer. */
export const footerNav: NavItem[] = [
  { label: 'Privacy', href: getPermalink('/privacy'), icon: 'tabler:shield-lock' },
  { label: 'Terms', href: getPermalink('/terms'), icon: 'tabler:file-text' },
  { label: 'Changelog', href: getPermalink('/changelog'), icon: 'tabler:history' },
  { label: 'RSS', href: getAsset('/rss.xml'), icon: 'tabler:rss' },
];

/** Social links, sourced from `template.social` in config.yaml so a fork only has to edit config. */
export const socialLinks: NavItem[] = (TEMPLATE?.social ?? []).map(
  (link: { label: string; href: string; icon: string }) => ({
    label: link.label,
    href: link.href,
    icon: link.icon,
  })
);

/**
 * @deprecated AstroWind demo header data. Nothing in the template design reads this anymore;
 * it remains only because `widgets/Header.astro` (via `LandingLayout.astro`) still imports it.
 * Safe to delete once those files are removed/reskinned.
 */
export const headerData = {
  links: [
    {
      text: 'Pages',
      links: [
        { text: 'Projects', href: getPermalink('/projects') },
        { text: 'Blog', href: getPermalink('/blog') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
  ],
  actions: [],
};

/**
 * @deprecated AstroWind demo footer data. Footer.astro now reads `footerNav`/`socialLinks` instead.
 * Kept only because `widgets/Footer.astro` still imports it.
 */
export const footerData = {
  links: [],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: socialLinks.map((link: NavItem) => ({ ariaLabel: link.label, icon: link.icon, href: link.href })),
  footNote: '',
};
