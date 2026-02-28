/**
 * Utility for conditionally joining class names.
 * A lightweight alternative to clsx/classnames.
 */
export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

/**
 * Merge Tailwind classes, resolving conflicts.
 * Later classes win over earlier ones for the same utility.
 */
export function mergeClasses(base: string, override: string): string {
  if (!override) return base;
  if (!base) return override;

  const baseSet = new Set(base.split(/\s+/));
  const overrideArr = override.split(/\s+/);

  for (const cls of overrideArr) {
    baseSet.add(cls);
  }

  return Array.from(baseSet).join(' ');
}
