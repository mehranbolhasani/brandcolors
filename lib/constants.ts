/**
 * Animation constants for consistent timing across the application
 */
export const ANIMATION = {
  /** Delay between staggered items (in seconds) */
  STAGGER_DELAY: 0.04,
  /** Duration for card appearance animations (in seconds) */
  CARD_APPEAR_DURATION: 0.18,
  /** Duration for header animations (in seconds) */
  HEADER_DURATION: 0.3,
} as const;

/**
 * File size limits for imports
 */
export const FILE_LIMITS = {
  /** Maximum file size for JSON imports (in bytes) - 5MB */
  MAX_JSON_SIZE: 5 * 1024 * 1024,
} as const;

