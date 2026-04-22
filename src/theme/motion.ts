export const duration = {
  fast: 150,
  base: 250,
  slow: 400,
  slower: 600,
} as const;

export const easing = {
  standard: [0.32, 0.72, 0, 1] as const,
  emphasized: [0.2, 0.8, 0.2, 1] as const,
  overshoot: [0.34, 1.56, 0.64, 1] as const,
};

export const spring = {
  ui: { damping: 18, stiffness: 220, mass: 1 },
  gentle: { damping: 20, stiffness: 140, mass: 1 },
  bouncy: { damping: 10, stiffness: 200, mass: 1 },
  snap: { damping: 24, stiffness: 320, mass: 0.9 },
} as const;
