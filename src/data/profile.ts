export interface Skill {
  name: string;
  level: number;
  summary: string;
}

export interface Fact {
  label: string;
  value: string;
}

export const skills: Skill[] = [
  {
    name: 'Systems Design',
    level: 92,
    summary: 'Architecting distributed systems and infrastructure',
  },
  {
    name: 'Terminal Development',
    level: 88,
    summary: 'Building CLI tools and terminal user interfaces',
  },
  {
    name: 'Kubernetes',
    level: 85,
    summary: 'Container orchestration and cluster management',
  },
  {
    name: 'TypeScript',
    level: 90,
    summary: 'Full-stack type-safe development',
  },
  {
    name: 'DevOps',
    level: 87,
    summary: 'Infrastructure automation and deployment pipelines',
  },
  {
    name: 'Database Design',
    level: 84,
    summary: 'Schema optimization and query performance',
  },
];

export const facts: Fact[] = [
  { label: 'Based in', value: 'Sector 7, Grid North' },
  { label: 'Focus', value: 'Infrastructure and developer tooling' },
  { label: 'Currently', value: 'Shipping small, efficient systems' },
  { label: 'Stack', value: 'Rust, TypeScript, Go' },
  { label: 'Uptime', value: '99.2% this quarter' },
  { label: 'Coffee', value: 'Dark roast, black' },
];

export interface StackGroup {
  group: string;
  items: string[];
}

export const stack: StackGroup[] = [
  {
    group: 'Languages',
    items: ['Rust', 'TypeScript', 'Go', 'Python', 'Bash'],
  },
  {
    group: 'Infrastructure',
    items: ['Kubernetes', 'Docker', 'Terraform', 'PostgreSQL', 'Redis'],
  },
  {
    group: 'Platforms',
    items: ['AWS', 'Netlify', 'GitHub Actions'],
  },
  {
    group: 'Tools',
    items: ['Neovim', 'Git', 'Nix', 'tmux', 'ripgrep'],
  },
];

export interface NowItem {
  updated: string;
  items: string[];
}

export const now: NowItem = {
  updated: '2026-09-25',
  items: [
    'Optimizing message queue internals for sub-millisecond latency',
    'Migrating status page to edge-based architecture',
    'Mentoring junior developers on systems thinking',
    'Exploring WebAssembly for performance-critical paths',
  ],
};

export interface UsesItem {
  name: string;
  note: string;
}

export interface UsesGroup {
  group: string;
  items: UsesItem[];
}

export const uses: UsesGroup[] = [
  {
    group: 'Hardware',
    items: [
      { name: 'ThinkPad X1 Carbon', note: 'Daily driver, 32GB RAM' },
      { name: 'Mechanical keyboard', note: 'Cherry MX switches' },
      { name: 'Ultrawide monitor', note: 'Split pane heaven' },
    ],
  },
  {
    group: 'Terminal',
    items: [
      { name: 'Fish shell', note: 'Smart completions' },
      { name: 'Neovim', note: 'Configuration in Lua' },
      { name: 'tmux', note: 'Session and pane management' },
    ],
  },
  {
    group: 'Editor',
    items: [
      { name: 'Neovim', note: 'With LSP for all languages' },
      { name: 'VS Code', note: 'For collaborative editing' },
    ],
  },
  {
    group: 'Services',
    items: [
      { name: 'GitHub', note: 'Source control and CI/CD' },
      { name: 'Fly.io', note: 'App deployment' },
      { name: 'Vercel', note: 'Frontend hosting' },
    ],
  },
];
