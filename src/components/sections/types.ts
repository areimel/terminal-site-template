/**
 * Shared types for `sections/*`. Kept in one place so `Hero` and `CTA` (both of which render a
 * row of buttons) don't each redeclare the same shape.
 */

export interface SectionAction {
  label: string;
  href: string;
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
}
