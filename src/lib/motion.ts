/**
 * Unified motion constants for AURA — all animations use these values.
 * Consistency here reads as "premium" far more than any individual animation's cleverness.
 */
export const EASE_STANDARD = [0.3, 0, 0, 1] as const;
export const DURATION_FAST   = 0.15; // hovers, menus, toasts
export const DURATION_BASE   = 0.25; // view transitions, panels
export const DURATION_SLOW   = 0.4;  // page-level reveals
